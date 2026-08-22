export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import AdminUsersTable from './admin-users-table';
import { Skeleton } from 'primereact/skeleton';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const AdminUsers = async () => {
  await requireAdminPage('admin:read');

  const adminUsers = await db.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      active: true,
      // Needed so the one screen for managing admins can show what each may do.
      role: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <>
      <PageHeader title="Admin users" description="Staff accounts and the roles that govern their access." />
      <Suspense fallback={<Skeleton width="100%" height="100px" />}>
        <AdminUsersTable adminUsers={adminUsers} />
      </Suspense>
    </>
  );
};

export default AdminUsers;
