'use server';

import { db } from '@/src/server/db';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IAdminUser } from '@/src/_models/admin-user.model';
import { requireAdminSession } from '@/src/server/authz';
import { captureException, logger } from '@repo/observability';
import { recordAudit } from '@/src/server/audit';

/**
 * Admin account management.
 *
 * Every path here can escalate privilege, so the rules are explicit:
 *   - `role` is settable, and defaults to the least-privileged tier;
 *   - an admin cannot deactivate or demote themselves;
 *   - the last active SUPER_ADMIN cannot be removed or demoted, because doing so
 *     locks everyone out with no route back except direct database access.
 */

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;

const ROLES = ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'CONTENT', 'SUPPORT'] as const;

/** True when demoting or deactivating this admin would leave no active super admin. */
async function isLastSuperAdmin(id: string): Promise<boolean> {
  const target = await db.adminUser.findFirst({
    where: { id, active: true },
    select: { role: true }
  });

  if (target?.role !== 'SUPER_ADMIN') return false;

  const others = await db.adminUser.count({
    where: { role: 'SUPER_ADMIN', active: true, id: { not: id } }
  });

  return others === 0;
}

export const createAdminUser = async (data: IAdminUser) => {
  const session = await requireAdminSession('admin:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
    active: z.boolean(),
    // Least privilege when unspecified.
    role: z.enum(ROLES).default('SUPPORT')
  });

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Invalid data',
      details: parsed.error.flatten().fieldErrors
    };
  }

  const { name, email, password, active, role } = parsed.data;
  // Stored lowercase to match the seed script and the reset flow; sign-in also
  // compares case-insensitively, but keeping one canonical form avoids duplicates.
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await db.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return { error: 'An admin with that email already exists' };
    }

    const passwordHash = await hash(password, BCRYPT_COST);

    const created = await db.adminUser.create({
      data: { name, email: normalizedEmail, active, role, passwordHash },
      select: { id: true, role: true }
    });

    await recordAudit({
      actor: session,
      action: 'admin.account_created',
      entity: 'AdminUser',
      entityId: created.id,
      summary: `Created admin with role ${created.role}`,
      metadata: { role: created.role, active }
    });

    revalidatePath('/manage-users/admin-users');
    return { message: 'Admin user created successfully' };
  } catch (error) {
    const captured = captureException(error, {
      source: 'admin-action',
      route: 'createAdminUser',
      actorId: session.id
    });
    return { error: `${captured.message} (ref ${captured.reference})` };
  }
};

export const updateAdminUser = async (data: IAdminUser) => {
  const session = await requireAdminSession('admin:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const schema = z.object({
    id: z.string().min(1),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email address'),
    active: z.boolean(),
    role: z.enum(ROLES)
  });

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Invalid data',
      details: parsed.error.flatten().fieldErrors
    };
  }

  const { id, name, email, active, role } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  // Self-protection: losing your own access mid-session is confusing, and doing it
  // as the only super admin is unrecoverable.
  if (id === session.id) {
    if (!active) {
      return { error: 'You cannot deactivate your own account' };
    }
    if (role !== 'SUPER_ADMIN' && session.role === 'SUPER_ADMIN') {
      return { error: 'You cannot remove your own super admin role' };
    }
  }

  if ((!active || role !== 'SUPER_ADMIN') && (await isLastSuperAdmin(id))) {
    return {
      error: 'This is the last active super admin. Promote another admin first.'
    };
  }

  try {
    const clash = await db.adminUser.findFirst({
      where: { email: normalizedEmail, id: { not: id } },
      select: { id: true }
    });
    if (clash) {
      return { error: 'Another admin already uses that email' };
    }

    const before = await db.adminUser.findUnique({
      where: { id },
      select: { role: true, active: true }
    });

    await db.adminUser.update({
      where: { id },
      data: { name, email: normalizedEmail, active, role }
    });

    // Role and activation changes are the ones worth being able to reconstruct.
    if (before && (before.role !== role || before.active !== active)) {
      await recordAudit({
        actor: session,
        action: 'admin.account_changed',
        entity: 'AdminUser',
        entityId: id,
        summary: `Role ${before.role} → ${role}, active ${before.active} → ${active}`,
        metadata: {
          fromRole: before.role,
          toRole: role,
          fromActive: before.active,
          toActive: active
        }
      });
    }

    revalidatePath('/manage-users/admin-users');
    return { message: 'Admin user updated successfully' };
  } catch (error) {
    const captured = captureException(error, {
      source: 'admin-action',
      route: 'updateAdminUser',
      actorId: session.id
    });
    return { error: `${captured.message} (ref ${captured.reference})` };
  }
};
