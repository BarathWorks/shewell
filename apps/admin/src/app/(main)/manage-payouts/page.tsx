export const revalidate = 0;

import React, { Suspense } from 'react';
import { Skeleton } from 'primereact/skeleton';
import PayoutsTable from './payouts-table';

const ManagePayouts = async () => {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Payouts</h1>
        <p className="text-gray-500 mt-1">Review and process doctor payout requests</p>
      </div>

      <Suspense fallback={<Skeleton width="100%" height="400px" />}>
        <PayoutsTable />
      </Suspense>
    </div>
  );
};

export default ManagePayouts;
