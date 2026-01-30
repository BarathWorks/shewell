// 'use server';
import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
// import StatesTable from './states-table';
import { Skeleton } from 'primereact/skeleton';

export const revalidate = 0;

const StatesPage = async () => {
  const states = await db.state.findMany({
    select: {
      id: true,
      name: true,
      stateCode: true,
      countryId: true,
      country: {
        select: {
          name: true
        }
      }
    },
    where: {
      deletedAt: null
    },
    orderBy: [
      {
        country: {
          name: 'asc'
        }
      },
      {
        name: 'asc'
      }
    ]
  });

  const countries = await db.country.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <Suspense fallback={<Skeleton width="100%" height="100px" />}>
      {/* <StatesTable states={states} countries={countries} /> */}
    </Suspense>
  );
};

export default StatesPage;
