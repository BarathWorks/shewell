import 'server-only';

import { redirect } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { roleHasPermission, type AdminPermission } from '@repo/database';
import type { AdminRole } from '@repo/database';
import { AppError, logger } from '@repo/observability';

import { db } from './db';
import { getServerAuthSession } from './auth';

/**
 * Admin authorization.
 *
 * The role is read from the database on every check rather than taken from the
 * session token. The token is a JWT with a 30-day life, so a role carried inside it
 * stays valid long after the role is changed or the account is disabled — meaning a
 * demoted or deactivated admin would keep their old access until it expired. One
 * indexed primary-key lookup buys immediate revocation.
 *
 * `active` is re-checked here for the same reason.
 */

export type AdminIdentity = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

/** Loads the current admin, or null when not signed in / no longer active. */
export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;

  const admin = await db.adminUser.findFirst({
    where: { id: session.user.id, active: true },
    select: { id: true, email: true, name: true, role: true }
  });

  return admin ?? null;
}

/**
 * Asserts the caller holds `permission`, and returns who they are.
 * Throws for use in server actions; see `requireAdminTrpc` for procedures.
 */
export async function requireAdmin(permission: AdminPermission): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new AppError('UNAUTHORIZED', 'Admin sign-in required');
  }

  if (!roleHasPermission(admin.role, permission)) {
    // Recorded: a denial is either a UI leak or someone probing.
    logger.warn('authz.denied', {
      source: 'admin-authz',
      userId: admin.id,
      role: admin.role,
      permission
    });
    throw new AppError('FORBIDDEN', 'You do not have access to this action', { permission });
  }

  return admin;
}

/** As `requireAdmin`, but throws the TRPCError codes the client expects. */
export async function requireAdminTrpc(permission: AdminPermission): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  if (!roleHasPermission(admin.role, permission)) {
    logger.warn('authz.denied', {
      source: 'admin-authz',
      userId: admin.id,
      role: admin.role,
      permission
    });
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return admin;
}

/** Non-throwing variant, for hiding UI a role cannot act on. */
export async function adminCan(permission: AdminPermission): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return roleHasPermission(admin?.role, permission);
}

/**
 * Guard for server actions, which report failure by returning `{ error }` rather
 * than throwing.
 *
 * Returns `null` when the caller holds the capability, or the error object to hand
 * straight back to the client. Keeping the existing return shape means adding a
 * permission check cannot change how a form surfaces the failure.
 *
 *   const denied = await guardAdmin('content:write');
 *   if (denied) return denied;
 */
export async function guardAdmin(
  permission: AdminPermission
): Promise<{ error: string } | null> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return { error: 'Unauthorized' };
  }

  if (!roleHasPermission(admin.role, permission)) {
    logger.warn('authz.denied', {
      source: 'admin-action',
      userId: admin.id,
      role: admin.role,
      permission
    });
    return { error: 'You do not have access to this action' };
  }

  return null;
}

/**
 * Drop-in replacement for `getServerSession()` in admin server actions.
 *
 * Returns the admin identity when they hold `permission`, otherwise `null` — so the
 * `if (!session) return { error: 'Unauthorized' }` guard each action already has
 * keeps working untouched, whatever shape it takes. That matters: the existing
 * checks were written by hand and are not all identical, and rewriting each one
 * would risk changing how a form reports failure.
 *
 * Unlike the bare `getServerSession()` it replaces, this verifies *who* the caller
 * is and *what* they may do, against the database.
 */
export async function requireAdminSession(
  permission: AdminPermission
): Promise<AdminIdentity | null> {
  const admin = await getCurrentAdmin();

  if (!admin) return null;

  if (!roleHasPermission(admin.role, permission)) {
    logger.warn('authz.denied', {
      source: 'admin-action',
      userId: admin.id,
      role: admin.role,
      permission
    });
    return null;
  }

  return admin;
}

/**
 * Guard for page server components.
 *
 * Redirects rather than throwing: a missing capability is a routing outcome, not a
 * crash, and the app already has an Access Denied page. Throwing would surface the
 * generic segment error boundary, which tells the user nothing about why.
 *
 * Middleware only proves a session exists — it has no view of roles — so without
 * this every page renders its data for any signed-in admin regardless of tier.
 */
export async function requireAdminPage(permission: AdminPermission): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/auth/login');
  }

  if (!roleHasPermission(admin.role, permission)) {
    logger.warn('authz.page_denied', {
      source: 'admin-page',
      userId: admin.id,
      role: admin.role,
      permission
    });
    redirect('/auth/access');
  }

  return admin;
}
