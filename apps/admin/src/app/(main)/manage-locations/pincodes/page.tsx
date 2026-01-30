export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import PincodesTable from './pincodes-table';
import { Skeleton } from 'primereact/skeleton';

const StatesPage = async () => {
  const availablePincodes = await db.availablePincodes.findMany({
    select: {
      id: true,
      pincode: true,
      stateId: true,
      state: {
        select: {
          id: true,
          name: true
          // country: {
          //   select: {
          //     id: true,
          //     name: true
          //   }
          // }
        }
      }
    },
    where: {
      deletedAt: null
    },
    orderBy: [
      {
        state: {
          // country: {
          //   name: 'asc'
          // }
        }
      },
      {
        state: {
          name: 'asc'
        }
      },
      {
        pincode: 'asc'
      }
    ]
  });

  const countries = await db.country.findMany({
    select: {
      id: true,
      name: true
      // states: {
      //   select: {
      //     id: true,
      //     name: true
      //   },
      //   where: {
      //     deletedAt: null
      //   },
      //   orderBy: {
      //     name: 'asc'
      //   }
      // }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return <Suspense fallback={<Skeleton width="100%" height="100px" />}>{/* <PincodesTable availablePincodes={availablePincodes} countries={countries} /> */}</Suspense>;
};

export default StatesPage;
