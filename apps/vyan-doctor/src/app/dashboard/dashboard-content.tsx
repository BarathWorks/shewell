"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import DatePickerWithRange from "./date-range-picker";
import PayoutHistory from "./payout-history";
import DashboardDataTable from "./dashboard-data-table";
import RequestPayoutModal from "./request-payout-modal";

const startingDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
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
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);

  const handleDatesFromDateRange = (data: IDateRange) => {
    setSelectedDates(data);
  };

  // Main Dashboard Data Query
  const { data, refetch: refetchOnlineAppointments } =
    api.noOfOnlineAppointments.noOfOnlineAppointments.useQuery({
      startDate: selectedDates?.from!,
      endDate: selectedDates?.to!,
    });

  // Balance Query
  const { data: balanceData, refetch: refetchBalance } =
    api.earnings.getBalance.useQuery();

  useEffect(() => {
    if (selectedDates) {
      refetchOnlineAppointments();
    }
  }, [selectedDates, refetchOnlineAppointments]);

  // Map Table Values
  const tableValues = data?.appointmentDataForTable.map((item) => ({
    id: item.id,
    patientName: item.patient.firstName,
    patientEmail: item.patient.email,
    bookingDate: new Date(item.startingTime),
    startingTime: new Date(item.startingTime),
    endingTime: new Date(item.endingTime),
    doctorSpecialicity: item.planName,
    status: item.status,
  })) || [];

  // Payout success callback
  const handlePayoutSuccess = () => {
    refetchBalance();
    refetchOnlineAppointments();
    setIsPayoutOpen(false);
  };

  // Next Appointment details
  const nextAppt = data?.upcomingAppointments?.[0];
  const nextApptTime = nextAppt ? format(new Date(nextAppt.startingTime), "hh:mm aa") : null;
  const nextApptPatientName = nextAppt ? nextAppt.patient.firstName : null;
  const nextInitial = nextApptPatientName ? nextApptPatientName[0] : "P";

  // Calculations for KPI Cards
  const scheduledCount = data?.onlineAppointments.length || 0;
  const changeInNoOfOnlineAppointments =
    data &&
    data.onlineAppointments.length - data.totalOnlineAppointments.length;
  const changeInPercentageInNoOfOnlineAppointments =
    changeInNoOfOnlineAppointments && data?.totalOnlineAppointments.length
      ? (changeInNoOfOnlineAppointments / data.totalOnlineAppointments.length) * 100
      : 0;

  const satisfiedPatientsCount = data?.noOfSatisfiedPatientsForDateRange.length || 0;
  const totalSatisfied = data?.totalNoOfSatisfiedPatients.length || 0;
  const satisfactionRate = totalSatisfied > 0 ? (satisfiedPatientsCount / totalSatisfied) * 100 : 95; // fallbacks to 95%

  const changeInNoOfSatisfiedPatients =
    data &&
    data.noOfSatisfiedPatientsForDateRange.length -
    data.totalNoOfSatisfiedPatients.length;
  const changeInPercentageInNoOfSatisfiedPatients =
    changeInNoOfSatisfiedPatients && data?.totalNoOfSatisfiedPatients.length
      ? (changeInNoOfSatisfiedPatients / data.totalNoOfSatisfiedPatients.length) * 100
      : 0.8;

  const availableBalance = balanceData?.availableBalanceInCents ?? 0;
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(availableBalance / 100);

  // Profit/Total Allocation (e.g. single session share vs couple session share)
  const totalCompletedAppointments = data?.onlineAppointments.length || 0;
  const coupleSessionsCount = data?.onlineAppointments.filter(
    (appt) => appt.planName?.toLowerCase().includes("couple")
  ).length || 0;
  const singleSessionsCount = totalCompletedAppointments - coupleSessionsCount;

  const singleSessionPct = totalCompletedAppointments > 0
    ? Math.round((singleSessionsCount / totalCompletedAppointments) * 100)
    : 0;
  const coupleSessionPct = totalCompletedAppointments > 0
    ? Math.round((coupleSessionsCount / totalCompletedAppointments) * 100)
    : 0;

  // Helper to compute dynamic heights for the 6-bar chart
  const getDynamicBars = () => {
    const defaultBars = [
      { totalHeight: "60%", innerHeight: "70%" },
      { totalHeight: "80%", innerHeight: "85%" },
      { totalHeight: "100%", innerHeight: "65%" },
      { totalHeight: "90%", innerHeight: "95%" },
      { totalHeight: "70%", innerHeight: "80%" },
      { totalHeight: "85%", innerHeight: "75%" },
    ];

    if (!data?.onlineAppointments || data.onlineAppointments.length === 0) {
      return defaultBars;
    }

    const startMs = selectedDates.from.getTime();
    const endMs = selectedDates.to.getTime();
    const diff = Math.max(endMs - startMs, 1);
    const intervalMs = diff / 6;

    const intervals = Array.from({ length: 6 }, (_, i) => {
      const start = startMs + i * intervalMs;
      const end = startMs + (i + 1) * intervalMs;
      return { start, end, appointments: [] as typeof data.onlineAppointments };
    });

    data.onlineAppointments.forEach((appt) => {
      const time = new Date(appt.startingTime).getTime();
      const interval = intervals.find((inv) => time >= inv.start && time <= inv.end);
      if (interval) {
        interval.appointments.push(appt);
      }
    });

    const maxCount = Math.max(...intervals.map((inv) => inv.appointments.length), 1);

    return intervals.map((inv) => {
      const total = inv.appointments.length;
      const coupleCount = inv.appointments.filter((a) =>
        a.planName?.toLowerCase().includes("couple")
      ).length;
      const singleCount = total - coupleCount;

      const totalHeightVal = Math.round((total / maxCount) * 100);
      const innerHeightVal = total > 0 ? Math.round((singleCount / total) * 100) : 0;

      return {
        totalHeight: total > 0 ? `${Math.max(totalHeightVal, 10)}%` : "0%",
        innerHeight: `${innerHeightVal}%`,
      };
    });
  };

  const dynamicBars = getDynamicBars();

  return (
    <div className="space-y-lg">
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display-lg text-display-lg text-primary">Dashboard Overview</h1>
        <DatePickerWithRange
          selectedDates={selectedDates}
          sendDatesToDashboardContent={handleDatesFromDateRange}
        />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {/* Next Appointment Card */}
        <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg flex flex-col justify-between min-h-[170px] border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <h3 className="text-label-caps text-on-surface-variant font-bold">Next Appointment</h3>
              {nextAppt ? (
                <div className="flex items-center gap-sm mt-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-body-md">
                    {nextInitial}
                  </div>
                  <div>
                    <p className="font-bold text-body-md text-on-surface">{nextApptPatientName}</p>
                    <p className="text-body-sm text-primary font-bold">{nextApptTime}</p>
                  </div>
                </div>
              ) : (
                <div className="text-body-sm text-on-surface-variant italic mt-3">
                  No upcoming sessions scheduled
                </div>
              )}
            </div>
            <div className="icon-badge bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
          </div>
          {nextAppt && (
            <Link
              href="/appointment"
              className="w-full bg-primary text-on-primary py-2.5 rounded-xl flex items-center justify-center gap-xs font-bold text-body-sm transition-all hover:opacity-90 mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              Join Session
            </Link>
          )}
        </div>

        {/* Scheduled Sessions Card */}
        <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg flex flex-col justify-between min-h-[170px] border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-label-caps text-on-surface-variant font-bold">Scheduled Sessions</h3>
              <div className="flex items-baseline gap-xs mt-3">
                <span className="text-headline-md font-bold text-on-surface">{scheduledCount}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    changeInPercentageInNoOfOnlineAppointments >= 0
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {changeInPercentageInNoOfOnlineAppointments >= 0 ? "+" : ""}
                  {changeInPercentageInNoOfOnlineAppointments.toFixed(1)}%
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">Confirmed this period</p>
            </div>
            <div className="icon-badge bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">event_available</span>
            </div>
          </div>
        </div>

        {/* Satisfied Patients Card */}
        <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg flex flex-col justify-between min-h-[170px] border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-label-caps text-on-surface-variant font-bold">Satisfied Patients</h3>
              <div className="flex items-baseline gap-xs mt-3">
                <span className="text-headline-md font-bold text-on-surface">
                  {Math.round(satisfactionRate)}%
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    changeInPercentageInNoOfSatisfiedPatients >= 0
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {changeInPercentageInNoOfSatisfiedPatients >= 0 ? "+" : ""}
                  {changeInPercentageInNoOfSatisfiedPatients.toFixed(1)}%
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">High ratings count</p>
            </div>
            <div className="icon-badge bg-secondary/10 text-secondary w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">thumb_up</span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg flex flex-col justify-between min-h-[170px] border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <h3 className="text-label-caps text-on-surface-variant font-bold">Available Balance</h3>
              <span className="text-headline-md font-bold tabular-nums text-on-surface mt-3 block">
                {formattedBalance}
              </span>
            </div>
            <div className="icon-badge bg-tertiary/10 text-tertiary w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <button
            onClick={() => setIsPayoutOpen(true)}
            className="w-full bg-surface-container-low text-primary border border-primary/10 py-2.5 rounded-xl font-bold text-body-sm hover:bg-surface-container transition-all"
          >
            Request Payout
          </button>
        </div>
      </div>

      {/* Charts and Payout Log Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Income Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl custom-shadow p-lg border border-outline-variant/10">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <h3 className="font-headline-sm text-on-surface">Income &amp; Allocation</h3>
              <p className="text-headline-md font-bold text-primary mt-1">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format((data?.doctorProfitForDateRange._sum.doctorShareInCents ?? 0) / 100)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {/* Dynamic Geometric Bar Chart */}
            <div className="flex items-end gap-2 h-48 pt-4">
              {dynamicBars.map((bar, index) => (
                <div
                  key={index}
                  style={{ height: bar.totalHeight }}
                  className="group relative flex-1 bg-secondary/20 rounded-t-lg hover:bg-secondary/35 transition-all cursor-pointer"
                >
                  <div
                    style={{ height: bar.innerHeight }}
                    className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                  ></div>
                </div>
              ))}
            </div>
            {/* Legend and progress bars */}
            <div className="space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm font-bold">
                  <span className="text-on-surface-variant">Single Sessions</span>
                  <span className="text-primary tabular-nums">{singleSessionPct}%</span>
                </div>
                <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${singleSessionPct}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm font-bold">
                  <span className="text-on-surface-variant">Couple Sessions</span>
                  <span className="text-secondary tabular-nums">{coupleSessionPct}%</span>
                </div>
                <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${coupleSessionPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Logs component */}
        <PayoutHistory />
      </div>

      {/* Patients Registry Table */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <DashboardDataTable tableValue={tableValues} />
      </div>

      {/* Payout Request Modal */}
      {isPayoutOpen && (
        <RequestPayoutModal
          isOpen={isPayoutOpen}
          onClose={() => setIsPayoutOpen(false)}
          availableBalance={availableBalance}
          onSuccess={handlePayoutSuccess}
        />
      )}
    </div>
  );
};

export default DashboardContent;
