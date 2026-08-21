import type { AdminRole } from '@repo/database';

export type IAdminUser = {
  id?: string;
  name: string;
  email: string;
  active: boolean;
  /** Capability tier. Omitted on create defaults to the least-privileged role. */
  role?: AdminRole;
  password?: string;
};

/** Selectable roles, ordered most to least privileged. */
export const ADMIN_ROLES: { value: AdminRole; label: string; description: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super admin', description: 'Everything, including managing admins' },
  { value: 'OPERATIONS', label: 'Operations', description: 'Users, practitioners, sessions and content' },
  { value: 'FINANCE', label: 'Finance', description: 'Payouts and financial records' },
  { value: 'CONTENT', label: 'Content', description: 'Blogs, banners, testimonials and sessions' },
  { value: 'SUPPORT', label: 'Support', description: 'Read-only' }
];
