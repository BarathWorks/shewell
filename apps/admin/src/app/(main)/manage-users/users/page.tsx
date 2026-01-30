export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import UsersTable from './users-table';
import { Skeleton } from 'primereact/skeleton';

const Users = async () => {
  // const users = await db.user.findMany({
  //   select: {
  //     id: true,
  //     email: true,
  //     firstName: true,
  //     middleName: true,
  //     lastName: true,
  //     accountType: true,
  //     active: true
  //   },
  //   orderBy: {
  //     createdAt: 'desc'
  //   }
  // });
  const users = [
    {
      id: '1',
      email: 'uio@gmail.com',
      firstName: 'rati',
      middleName: 'ueiwo',
      lastName: 'wer-0',
      accountType: 'normal',
      active: true
    },
    {
      id: '1',
      email: 'uio@gmail.com',
      firstName: 'rati',
      middleName: 'ueiwo',
      lastName: 'wer-0',
      accountType: 'normal',
      active: true
    }
  ];

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <UsersTable users={users} />
    </Suspense>
  );
};

export default Users;
