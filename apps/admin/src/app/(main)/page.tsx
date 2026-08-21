/* eslint-disable @next/next/no-img-element */

// Live dashboard: must not be prerendered. Static generation froze the
// figures at build time and made the whole build depend on the database
// being reachable from CI.
export const dynamic = 'force-dynamic';

import React from 'react';
import { db } from '@/src/server/db';
import { subMonths } from 'date-fns';
import DateRangeForAppointmentData from '@/src/_components/dashboard/date-range-for-appointment-data';
import RecentAppointmentTable from '@/src/_components/dashboard/recent-appointment-table';
import DoctorsOnBoardForDateRange from '@/src/_components/dashboard/appointment-data-for-date-range';
import TotalDoctorsOnBoard from '@/src/_components/dashboard/total-appointment-data';
import { requireAdminPage } from '@/src/server/authz';

const Dashboard = async () => {
  await requireAdminPage('appointment:read');

  const newUsers = await db.user.count({
    where: {
      createdAt: {
        lte: new Date(),
        gte: subMonths(new Date(), 1)
      }
    }
  });

  return (
    <>
      <DateRangeForAppointmentData />
      <div className="grid">
        <TotalDoctorsOnBoard />
        <DoctorsOnBoardForDateRange />

        <div className="col-12 ">
          <RecentAppointmentTable />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
