export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import { Skeleton } from 'primereact/skeleton';
import { requireAdminPage } from '@/src/server/authz';
import UsersTable from './users-table';

/**
 * Customer accounts.
 *
 * This page previously rendered two hardcoded rows while the real query sat
 * commented out — and that query selected columns the `User` model does not have,
 * so it could not have run.
 */
const Users = async () => {
  await requireAdminPage('user:read');

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      verifiedAt: true,
      deletedAt: true,
      createdAt: true,
      _count: { select: { sessionRegistrations: true } }
    },
    orderBy: { createdAt: 'desc' },
    // Bounded. Server-side paging is still to come; until then this caps the
    // payload rather than serialising the entire table to the browser.
    take: 200
  });

  const rows = users.map(({ _count, ...user }) => ({
    ...user,
    registrationCount: _count.sessionRegistrations
  }));

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <UsersTable users={rows} />
    </Suspense>
  );
};

export default Users;
