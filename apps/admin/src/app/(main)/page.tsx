/* eslint-disable @next/next/no-img-element */

// Live dashboard: must not be prerendered. Static generation froze the
// figures at build time and made the whole build depend on the database
// being reachable from CI.
export const dynamic = 'force-dynamic';

import React from 'react';
import DateRangeForAppointmentData from '@/src/_components/dashboard/date-range-for-appointment-data';
import RecentAppointmentTable from '@/src/_components/dashboard/recent-appointment-table';
import DashboardStats from '@/src/_components/dashboard/dashboard-stats';
import { requireAdminPage } from '@/src/server/authz';

/**
 * Admin dashboard.
 *
 * The `newUsers` count this page used to compute was assigned to a local and
 * never rendered — a database round trip on every request whose result was
 * discarded. The figure it was reaching for is now shown, from the same query
 * that feeds the rest of the cards, so the page itself no longer queries at all.
 */
const Dashboard = async () => {
  await requireAdminPage('appointment:read');

  return (
    <div className="flex flex-column gap-4">
      <div className="flex flex-wrap align-items-end justify-content-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold m-0" style={{ color: 'var(--sw-ink)' }}>
            Dashboard
          </h1>
          <p className="sw-footnote mt-2">
            Platform activity across practitioners, patients and bookings.
          </p>
        </div>

        <DateRangeForAppointmentData />
      </div>

      <div className="grid">
        <DashboardStats />

        <div className="col-12">
          <RecentAppointmentTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
