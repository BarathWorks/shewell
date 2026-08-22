export const revalidate = 0;

import React, { Suspense } from 'react';
import { Skeleton } from 'primereact/skeleton';
import PayoutsTable from './payouts-table';
import { requireAdminPage } from '@/src/server/authz';

import PageHeader from '@/src/_components/shared/page-header';
const ManagePayouts = async () => {
  await requireAdminPage('payout:read');

  return (
    <>
      <PageHeader title="Payouts" description="Review practitioner earnings and initiate payouts." />
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Payouts</h1>
          <p className="text-gray-500 mt-1">Select a doctor, review their earnings, and initiate payouts</p>
        </div>

        <Suspense fallback={<Skeleton width="100%" height="400px" />}>
          <PayoutsTable />
        </Suspense>
      </div>
    </>
  );
};

export default ManagePayouts;
