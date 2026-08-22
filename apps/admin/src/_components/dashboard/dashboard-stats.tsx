'use client';

import { format } from 'date-fns';
import { apiClient } from '@/src/trpc/react';
import useDashboardRange, { DEFAULT_RANGE_DAYS } from '@/src/_hooks/useDashboardRange';
import StatTile from './stat-tile';

/**
 * The dashboard's headline figures.
 *
 * Replaces `total-appointment-data.tsx` and `appointment-data-for-date-range.tsx`,
 * which between them had four problems:
 *
 *  1. Both read `data?.totalDoctorsOnBoard` — the *same field* — and labelled one
 *     "Total Doctors Onboard" and the other "New Doctors Onboard (range)". The two
 *     cards always showed an identical number.
 *  2. That field is not a total. The router filters it by `createdAt >= startDate`,
 *     so the "Total" card changed every time the date range moved.
 *  3. `totalDoctorsOnBoardWithinDateRange`, `newUsers` and `users` were all fetched
 *     by the query and never rendered — the correct field for card 1 was sitting
 *     right there, unused.
 *  4. With no `startDate`/`endDate` in the URL — which is the state on first load —
 *     both components called `new Date('')`, an Invalid Date, and passed it to the
 *     query. `formatISO` throws on that, so the dashboard's own first render put
 *     the request into an error state.
 *
 * The range now defaults to the last 30 days when the URL carries no dates, every
 * figure is read from the field that actually means what the label says, and each
 * tile compares against the preceding period of equal length.
 */

const DashboardStats = () => {
  const { startDate, endDate, isDefaulted } = useDashboardRange();

  const { data, isLoading, error } = apiClient.noOfOnlineAppointments.noOfOnlineAppointments.useQuery({
    startDate,
    endDate
  });

  const currency = (cents: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(cents / 100);

  /** Percentage change, or null when there is no baseline to compare against. */
  const pct = (current: number, previous: number): number | null => {
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / previous) * 100;
  };

  const appointments = data?.totalAppointmentsWithCountAndPrice._count.id ?? 0;
  const revenue = data?.totalAppointmentsWithCountAndPrice._sum.totalPriceInCents ?? 0;
  const cancelled = data?.cancelledAppointments._count.id ?? 0;
  const newDoctors = data?.totalDoctorsOnBoardWithinDateRange ?? 0;
  const newUsers = data?.newUsers ?? 0;
  const allTimeDoctors = data?.allTimeDoctorsOnBoard ?? 0;
  const prev = data?.previous;

  const rangeLabel = `${format(startDate, 'd MMM')} – ${format(endDate, 'd MMM yyyy')}`;

  if (error) {
    return (
      <div className="col-12">
        <div className="sw-card">
          <div className="sw-card-body sw-empty">
            <p className="sw-empty-title">Could not load dashboard figures</p>
            <p className="sw-empty-hint">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 md:col-6 xl:col-4">
            <div className="sw-card h-full">
              <div className="sw-card-body">
                <div className="skeleton-line" style={{ width: '40%' }} />
                <div className="skeleton-line" style={{ width: '55%', height: '1.75rem', marginTop: '1rem' }} />
                <div className="skeleton-line" style={{ width: '70%', marginTop: '1.5rem' }} />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="col-12">
        <p className="sw-footnote mb-3">
          Showing {rangeLabel}
          {isDefaulted ? ' (last 30 days by default)' : ''}, compared with the
          preceding {data?.range.spanDays ?? DEFAULT_RANGE_DAYS} days.
        </p>
      </div>

      <div className="col-12 md:col-6 xl:col-4">
        <StatTile
          label="Paid appointments"
          value={appointments.toLocaleString('en-IN')}
          secondaryLabel="Revenue"
          secondaryValue={currency(revenue)}
          deltaPct={prev ? pct(appointments, prev.appointments) : undefined}
          icon="pi-calendar"
          intent="brand"
        />
      </div>

      <div className="col-12 md:col-6 xl:col-4">
        <StatTile
          label="Cancellations"
          value={cancelled.toLocaleString('en-IN')}
          deltaPct={prev ? pct(cancelled, prev.cancelled) : undefined}
          invertDelta
          icon="pi-times-circle"
          intent="danger"
          footnote={
            appointments + cancelled > 0
              ? `${((cancelled / (appointments + cancelled)) * 100).toFixed(1)}% of bookings in range`
              : undefined
          }
        />
      </div>

      <div className="col-12 md:col-6 xl:col-4">
        <StatTile
          label="Revenue"
          value={currency(revenue)}
          deltaPct={prev ? pct(revenue, prev.revenueInCents) : undefined}
          icon="pi-indian-rupee"
          intent="success"
          footnote="From appointments marked payment successful"
        />
      </div>

      <div className="col-12 md:col-6 xl:col-4">
        <StatTile
          label="New practitioners"
          value={newDoctors.toLocaleString('en-IN')}
          deltaPct={prev ? pct(newDoctors, prev.newDoctors) : undefined}
          icon="pi-user-plus"
          intent="info"
          footnote={`${allTimeDoctors.toLocaleString('en-IN')} onboarded in total`}
        />
      </div>

      <div className="col-12 md:col-6 xl:col-4">
        <StatTile
          label="New patients"
          value={newUsers.toLocaleString('en-IN')}
          deltaPct={prev ? pct(newUsers, prev.newUsers) : undefined}
          icon="pi-users"
          intent="brand"
          footnote="Customer accounts created in range"
        />
      </div>

      <div className="col-12 md:col-6 xl:col-4">
        <StatTile
          label="Average booking value"
          value={appointments > 0 ? currency(revenue / appointments) : '—'}
          deltaPct={
            prev && prev.appointments > 0 && appointments > 0
              ? pct(revenue / appointments, prev.revenueInCents / prev.appointments)
              : undefined
          }
          icon="pi-chart-line"
          intent="warning"
          footnote={appointments > 0 ? 'Revenue ÷ paid appointments' : 'No paid appointments in range'}
        />
      </div>
    </>
  );
};

export default DashboardStats;
