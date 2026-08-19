/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { db } from '@/src/server/db';
import { subMonths } from 'date-fns';
import DateRangeForAppointmentData from '@/src/_components/dashboard/date-range-for-appointment-data';
import RecentAppointmentTable from '@/src/_components/dashboard/recent-appointment-table';
import DoctorsOnBoardForDateRange from '@/src/_components/dashboard/appointment-data-for-date-range';
import TotalDoctorsOnBoard from '@/src/_components/dashboard/total-appointment-data';

const Dashboard = async () => {
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
