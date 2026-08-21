'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/src/server/authz';
import { captureException, logger } from '@repo/observability';
import { recordAudit } from '@/src/server/audit';

/**
 * Customer account administration.
 *
 * Deliberately narrow. Customers register themselves and verify by OTP, so there
 * is no admin-side create; and editing a patient's own details from here is not a
 * capability this product should have. What an operator legitimately needs is to
 * disable an account and to put it back.
 *
 * Disabling is a soft delete — `deletedAt` — so history, bookings and payment
 * records stay intact.
 */

const idSchema = z.object({ id: z.string().min(1) });

export const deactivateUser = async (data: { id: string }) => {
  const session = await requireAdminSession('user:write');

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const parsed = idSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid data' };
  }

  try {
    const user = await db.user.findFirst({
      where: { id: parsed.data.id, deletedAt: null },
      select: { id: true }
    });

    if (!user) {
      return { error: 'User not found or already disabled' };
    }

    await db.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() }
    });

    await recordAudit({
      actor: session,
      action: 'user.disabled',
      entity: 'User',
      entityId: user.id,
      summary: 'Customer account disabled'
    });

    revalidatePath('/manage-users/users');
    return { message: 'User disabled' };
  } catch (error) {
    const captured = captureException(error, {
      source: 'admin-action',
      route: 'deactivateUser',
      actorId: session.id
    });
    return { error: `${captured.message} (ref ${captured.reference})` };
  }
};

export const restoreUser = async (data: { id: string }) => {
  const session = await requireAdminSession('user:write');

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const parsed = idSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid data' };
  }

  try {
    const user = await db.user.findFirst({
      where: { id: parsed.data.id, deletedAt: { not: null } },
      select: { id: true }
    });

    if (!user) {
      return { error: 'User not found or already active' };
    }

    await db.user.update({
      where: { id: user.id },
      data: { deletedAt: null }
    });

    await recordAudit({
      actor: session,
      action: 'user.restored',
      entity: 'User',
      entityId: user.id,
      summary: 'Customer account restored'
    });

    revalidatePath('/manage-users/users');
    return { message: 'User restored' };
  } catch (error) {
    const captured = captureException(error, {
      source: 'admin-action',
      route: 'restoreUser',
      actorId: session.id
    });
    return { error: `${captured.message} (ref ${captured.reference})` };
  }
};
