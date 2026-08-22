export const revalidate = 0;

import React, { Suspense } from 'react';
import { db } from '@/src/server/db';
import CountriesTable from './countries-table';
import { Skeleton } from 'primereact/skeleton';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const Countries = async () => {
  await requireAdminPage('content:read');

  const countries = await db.country.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      iso3: true,
      iso2: true,
      phoneCode: true,
      currency: true,
      currencyName: true,
      currencySymbol: true
    },
    orderBy: [
      {
        active: 'desc'
      },
      {
        name: 'asc'
      }
    ]
  });

  return (
    <>
      <PageHeader title="Countries" description="Reference data used by practitioner addresses." />
      <Suspense fallback={<Skeleton width="100%" height="100px" />}>
        <CountriesTable countries={countries} />
      </Suspense>
    </>
  );
};

export default Countries;
