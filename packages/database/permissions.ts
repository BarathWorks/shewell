import type { AdminRole } from "@prisma/client";

/**
 * Admin capabilities.
 *
 * Every AdminUser previously had unrestricted access: the only check anywhere was
 * "is someone signed in". That meant a content editor could initiate payouts and
 * create further admins. Capabilities are granted per role, and denied by default.
 *
 * Naming is `resource:action`. Read and write are separate so a role can be given
 * visibility without the ability to change anything.
 */
export type AdminPermission =
  | "admin:read"
  | "admin:write"
  | "payout:read"
  | "payout:write"
  | "user:read"
  | "user:write"
  | "doctor:read"
  | "doctor:write"
  | "session:read"
  | "session:write"
  | "appointment:read"
  | "appointment:write"
  | "content:read"
  | "content:write";

const READ_ONLY: AdminPermission[] = [
  "user:read",
  "doctor:read",
  "session:read",
  "appointment:read",
  "content:read",
  // Deliberately no `payout:read`: that view exposes practitioner bank account
  // numbers and IFSC codes, which a support agent has no reason to see. Financial
  // visibility belongs to FINANCE, OPERATIONS and SUPER_ADMIN.
];

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "admin:read",
    "admin:write",
    "payout:read",
    "payout:write",
    "user:read",
    "user:write",
    "doctor:read",
    "doctor:write",
    "session:read",
    "session:write",
    "appointment:read",
    "appointment:write",
    "content:read",
    "content:write",
  ],
  OPERATIONS: [
    "user:read",
    "user:write",
    "doctor:read",
    "doctor:write",
    "session:read",
    "session:write",
    "appointment:read",
    "appointment:write",
    "content:read",
    "content:write",
    // Visibility into payouts, but not the ability to move money.
    "payout:read",
  ],
  FINANCE: ["payout:read", "payout:write", "user:read", "doctor:read", "appointment:read"],
  CONTENT: ["content:read", "content:write", "session:read", "session:write"],
  SUPPORT: READ_ONLY,
};

/** True when the role grants the capability. Unknown roles grant nothing. */
export function roleHasPermission(
  role: AdminRole | null | undefined,
  permission: AdminPermission
): boolean {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role];
  if (!granted) return false;
  return granted.includes(permission);
}

/** All capabilities for a role — useful for hiding UI the user cannot act on. */
export function permissionsForRole(role: AdminRole | null | undefined): AdminPermission[] {
  if (!role) return [];
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

/** Roles that may act on other admin accounts. Kept explicit for auditability. */
export function canManageAdmins(role: AdminRole | null | undefined): boolean {
  return roleHasPermission(role, "admin:write");
}
