export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import AdminUsersTable from './admin-users-table';
import { Skeleton } from 'primereact/skeleton';

const AdminUsers = async () => {
  const adminUsers = await db.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      active: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <AdminUsersTable adminUsers={adminUsers} />
    </Suspense>
  );
};

export default AdminUsers;
