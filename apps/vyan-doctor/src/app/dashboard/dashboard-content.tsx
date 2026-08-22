"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  BadgeIndianRupee,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

import DatePickerWithRange from "./date-range-picker";
import StatCard from "./stat-card";
import ConsultationsByCategory from "./consultations-by-category";
import WeeklyBookings from "./weekly-bookings";
import Balance from "./balance";
import PayoutHistory from "./payout-history";
import DashboardDataTable from "./dashboard-data-table";
import DashboardNotification from "./dashboard-notifications";
import { Panel } from "./panel";
import { api } from "~/trpc/react";

/**
 * Practitioner dashboard.
 *
 * Every figure on this screen is now derived from a query — see
 * `server/api/routers/dashboard-analytics.ts` for what each one counts and the
 * list of invented values it replaced.
 *
 * Three specific corrections in this file:
 *
 *  - "Pending Appointments" showed `tableValues?.length`, the number of rows in
 *    the table below, which is every appointment in the range whatever its
 *    state. It always equalled the table length and never described anything
 *    pending. It now counts PAYMENT_PENDING and PAYMENT_SUCCESSFUL.
 *  - "Total Appointments" and "Online Appointments" were assigned the *same*
 *    expression (`totalAppointmentsWithoutAnyStatus.length`), so the two tiles
 *    always matched and "Online" was necessarily 100%. They are separate counts
 *    now, split on `serviceType`.
 *  - Deltas subtracted an all-time total from a range total, so any doctor with
 *    history saw a large negative "change". They compare against the preceding
 *    period of equal length.
 */

const startingDate = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1,
);
const endingDate = new Date();

interface IDateRange {
  from: Date;
  to: Date;
}

const DashboardContent = () => {
  const [selectedDates, setSelectedDates] = useState<IDateRange>({
    from: startingDate,
    to: endingDate,
  });

  const handleDatesFromDateRange = (data: IDateRange) => setSelectedDates(data);

  // tRPC refetches automatically when the inputs change; the manual
  // `refetch()` in a `useEffect` keyed on the same inputs that this replaced
  // fired a second identical request on every range change.
  const { data, isLoading } = api.dashboardAnalytics.getDashboard.useQuery({
    startDate: selectedDates.from,
    endDate: selectedDates.to,
  });

  const { data: legacy } = api.noOfOnlineAppointments.noOfOnlineAppointments.useQuery(
    {
      startDate: selectedDates.from,
      endDate: selectedDates.to,
    },
  );

  const appts = data?.appointments;

  const tableValues = legacy?.appointmentDataForTable.map((item) => ({
    id: item.id,
    patientName: item.patient.firstName,
    patientEmail: item.patient.email,
    bookingDate: new Date(item.startingTime),
    startingTime: new Date(item.startingTime),
    endingTime: new Date(item.endingTime),
    doctorSpecialicity:
      item.professionalUser.displayQualification?.specialization,
    status: item.status,
    serviceType: item.serviceType,
  }));

  const currency = (cents: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const rangeLabel = `${format(selectedDates.from, "d MMM")} – ${format(selectedDates.to, "d MMM yyyy")}`;

  return (
    <div className="container-page py-6 md:py-8">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Showing {rangeLabel}, compared with the preceding{" "}
            {data?.range.spanDays ?? 0} days.
          </p>
        </div>

        <DatePickerWithRange
          selectedDates={selectedDates}
          sendDatesToDashboardContent={handleDatesFromDateRange}
        />
      </div>

      {/* Key figures */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Appointments"
          value={appts?.total ?? 0}
          deltaPct={appts?.totalChangePct}
          icon={CalendarClock}
          intent="brand"
          isLoading={isLoading}
        />
        <StatCard
          label="Completed"
          value={appts?.completed ?? 0}
          deltaPct={appts?.completedChangePct}
          icon={CheckCircle2}
          intent="positive"
          footnote={
            appts && appts.total > 0
              ? `${((appts.completed / appts.total) * 100).toFixed(0)}% of appointments in range`
              : undefined
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Awaiting payment"
          value={appts?.pending ?? 0}
          deltaPct={null}
          icon={CalendarX2}
          intent="warning"
          footnote="Booked but not yet settled"
          isLoading={isLoading}
        />
        <StatCard
          label="Earnings"
          value={currency(data?.earnings.inRangeInCents ?? 0)}
          deltaPct={data?.earnings.changePct}
          icon={BadgeIndianRupee}
          intent="brand"
          isLoading={isLoading}
        />
      </div>

      {/* Mix and ratings */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Online"
          value={appts?.online ?? 0}
          deltaPct={appts?.onlineChangePct}
          icon={Stethoscope}
          footnote={
            appts && appts.total > 0
              ? `${((appts.online / appts.total) * 100).toFixed(0)}% of appointments`
              : undefined
          }
          isLoading={isLoading}
        />
        <StatCard
          label="In person"
          value={appts?.offline ?? 0}
          deltaPct={null}
          footnote={
            appts && appts.total > 0
              ? `${((appts.offline / appts.total) * 100).toFixed(0)}% of appointments`
              : undefined
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Cancelled"
          value={appts?.cancelled ?? 0}
          deltaPct={null}
          intent={appts && appts.cancelled > 0 ? "danger" : "neutral"}
          footnote="Includes refunded cancellations"
          isLoading={isLoading}
        />
        <StatCard
          label="Average rating"
          value={
            data?.ratings.count
              ? `${data.ratings.average?.toFixed(1)} / 5`
              : "—"
          }
          deltaPct={null}
          footnote={
            data?.ratings.count
              ? `From ${data.ratings.count} ${data.ratings.count === 1 ? "review" : "reviews"} in range`
              : "No reviews in this range"
          }
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ConsultationsByCategory
          data={data?.categoryBreakdown}
          isLoading={isLoading}
        />
        <WeeklyBookings
          data={data?.weekly}
          weeklyCapacity={data?.weeklyCapacity}
          isLoading={isLoading}
        />
      </div>

      {/* Money and notifications */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Balance
          series={data?.earnings.series}
          earnedInRange={data?.earnings.inRangeInCents}
          isLoading={isLoading}
        />
        <PayoutHistory />
        <DashboardNotification notifications={legacy?.notifications} />
      </div>

      {/* Appointments */}
      <div className="mt-4">
        <Panel title="Appointments in range" bodyClassName="p-0 sm:p-0">
          {tableValues ? (
            <DashboardDataTable tableValue={tableValues} />
          ) : (
            <div className="p-5">
              <div className="skeleton h-64 w-full" />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default DashboardContent;
