export const dynamic = 'force-dynamic';

import { db } from '@/src/server/db';
import RegistrationTable from './registration-table';
import { Skeleton } from 'primereact/skeleton';
import React, { Suspense } from 'react';

const RegistrationsPage = async () => {
  const registrations = await db.sessionRegistration.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      session: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          startAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert Decimal to number for registration table
  const formattedRegistrations = registrations.map(reg => ({
    ...reg,
    amountPaid: reg.amountPaid ? Number(reg.amountPaid) : null,
    session: {
      ...reg.session,
      price: Number(reg.session.price)
    }
  }));

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      <RegistrationTable registrations={formattedRegistrations} />
    </Suspense>
  );
};

export default RegistrationsPage;

