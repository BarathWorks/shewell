'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { format } from 'date-fns';
import { apiClient } from '@/src/trpc/react';
import DateRangeForAppointmentData from './date-range-for-appointment-data';

interface SerializedSession {
  id: string;
  title: string;
  startAt: string;
  price: number;
  meetingLink: string;
}

interface SerializedPayout {
  id: string;
  createdAt: string;
  amountInCents: number;
  status: string;
  doctor: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DashboardContentProps {
  initialSessions: SerializedSession[];
  initialPayouts: SerializedPayout[];
}

const DashboardContent = ({ initialSessions, initialPayouts }: DashboardContentProps) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set dates from URL parameters or default to past 30 days
    const start = searchParams.get('startDate') || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const end = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd');
    setStartDate(start);
    setEndDate(end);
  }, [searchParams]);

  // Fetch dynamic database analytics via tRPC based on selected dates
  const { data, isLoading } = apiClient.noOfOnlineAppointments.noOfOnlineAppointments.useQuery({
    startDate: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(endDate || Date.now())
  }, {
    enabled: !!startDate && !!endDate
  });

  // Calculate dynamic chart datasets when tRPC data changes
  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#40484b';
    const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#00898f';

    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let counts = [0, 0, 0, 0, 0, 0, 0];

    if (data?.appointmentDataForTable && data.appointmentDataForTable.length > 0) {
      const grouped: Record<string, number> = {};
      data.appointmentDataForTable.forEach((apt: any) => {
        const dateKey = format(new Date(apt.startingTime), 'MMM dd');
        grouped[dateKey] = (grouped[dateKey] || 0) + 1;
      });

      // Sort dates chronologically
      labels = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      counts = labels.map((label) => grouped[label]);
    }

    const dataSet = {
      labels,
      datasets: [
        {
          label: 'Appointments',
          data: counts,
          fill: true,
          borderColor: primaryColor,
          tension: 0.4,
          backgroundColor: 'rgba(0, 137, 143, 0.03)',
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: textColorSecondary, font: { family: 'Inter', size: 12 } }
        },
        y: {
          grid: { display: false, drawBorder: false },
          ticks: { color: textColorSecondary, font: { family: 'Inter', size: 12 } }
        }
      }
    };

    setChartData(dataSet);
    setChartOptions(options);
  }, [data]);

  // Dynamic calculations for Stats
  const totalRevenue = (data?.totalAppointmentsWithCountAndPrice?._sum?.totalPriceInCents || 0) / 100;
  const totalAppointments = data?.totalAppointmentsWithCountAndPrice?._count?.id || 0;
  const newUsersCount = data?.newUsers || 0;
  const totalDoctors = data?.totalDoctorsOnBoard || 0;

  // Dynamic calculations for circular progress (Breakdown)
  const successCount = totalAppointments;
  const cancelledCount = data?.cancelledAppointments?._count?.id || 0;
  const totalBookings = successCount + cancelledCount;
  const successPercentage = totalBookings > 0 ? Math.round((successCount / totalBookings) * 100) : 100;
  const othersPercentage = 100 - successPercentage;

  return (
    <div className="flex flex-column gap-4 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-end mb-2 gap-3">
        <div>
          <h2 className="m-0 text-3xl font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Dashboard</h2>
          <p className="m-0 text-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>System status overview</p>
        </div>
        <div className="flex align-items-center gap-3">
          <DateRangeForAppointmentData />
          <Button label="Export" icon="pi pi-upload" style={{ height: '38px', backgroundColor: '#00898f', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 'bold' }} />
        </div>
      </div>

      {/* 2. Top Stats Metrics Grid (4 columns) */}
      <div className="grid">
        {/* Appointments */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="card p-3 flex align-items-center gap-3 w-full" style={{ border: '1px solid var(--surface-border)', minHeight: '100px' }}>
            <div className="flex align-items-center justify-content-center border-round-lg text-primary" style={{ width: '3rem', height: '3rem', backgroundColor: '#eff4ff', fontSize: '1.5rem', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_month</span>
            </div>
            <div className="flex-grow-1 min-w-0">
              <span className="text-xs font-bold text-500 uppercase tracking-wider block mb-1" style={{ letterSpacing: '0.05em' }}>Appointments</span>
              <span className="text-2xl font-bold text-900 block" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{isLoading ? '...' : totalAppointments}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="card p-3 flex align-items-center gap-3 w-full" style={{ border: '1px solid var(--surface-border)', minHeight: '100px' }}>
            <div className="flex align-items-center justify-content-center border-round-lg text-primary" style={{ width: '3rem', height: '3rem', backgroundColor: '#eff4ff', fontSize: '1.5rem', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>payments</span>
            </div>
            <div className="flex-grow-1 min-w-0">
              <span className="text-xs font-bold text-500 uppercase tracking-wider block mb-1" style={{ letterSpacing: '0.05em' }}>Revenue</span>
              <span className="text-2xl font-bold text-900 block" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{isLoading ? '...' : `₹${totalRevenue.toLocaleString()}`}</span>
            </div>
          </div>
        </div>

        {/* Total Patients */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="card p-3 flex align-items-center gap-3 w-full" style={{ border: '1px solid var(--surface-border)', minHeight: '100px' }}>
            <div className="flex align-items-center justify-content-center border-round-lg text-primary" style={{ width: '3rem', height: '3rem', backgroundColor: '#eff4ff', fontSize: '1.5rem', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>group</span>
            </div>
            <div className="flex-grow-1 min-w-0">
              <span className="text-xs font-bold text-500 uppercase tracking-wider block mb-1" style={{ letterSpacing: '0.05em' }}>Total Patients</span>
              <span className="text-2xl font-bold text-900 block" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{isLoading ? '...' : newUsersCount}</span>
            </div>
          </div>
        </div>

        {/* Active Doctors */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="card p-3 flex align-items-center gap-3 w-full" style={{ border: '1px solid var(--surface-border)', minHeight: '100px' }}>
            <div className="flex align-items-center justify-content-center border-round-lg text-primary" style={{ width: '3rem', height: '3rem', backgroundColor: '#eff4ff', fontSize: '1.5rem', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>medical_information</span>
            </div>
            <div className="flex-grow-1 min-w-0">
              <span className="text-xs font-bold text-500 uppercase tracking-wider block mb-1" style={{ letterSpacing: '0.05em' }}>Active Doctors</span>
              <span className="text-2xl font-bold text-900 block" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{isLoading ? '...' : totalDoctors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mid Grid Section (Line Chart & Status Breakdown) */}
      <div className="grid">
        {/* Line Chart */}
        <div className="col-12 lg:col-8">
          <div className="card h-full p-4" style={{ border: '1px solid var(--surface-border)' }}>
            <div className="flex justify-content-between align-items-center mb-4">
              <div>
                <span className="text-xs font-bold text-500 uppercase tracking-wider block" style={{ letterSpacing: '0.05em' }}>Overview</span>
                <h5 className="m-0 text-xl font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Appointment Trend</h5>
              </div>
              <button className="p-link text-sm font-bold text-primary" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Full Report</button>
            </div>
            <div style={{ height: '260px' }}>
              {isLoading ? (
                <div className="flex align-items-center justify-content-center h-full text-500">Loading chart data...</div>
              ) : (
                <Chart type="line" data={chartData} options={chartOptions} style={{ height: '100%', width: '100%' }} />
              )}
            </div>
          </div>
        </div>

        {/* Status Breakdown & Target progress column */}
        <div className="col-12 lg:col-4 flex flex-column gap-4">
          {/* Status Breakdown Doughnut SVG */}
          <div className="card p-4 flex-1" style={{ border: '1px solid var(--surface-border)' }}>
            <h5 className="m-0 text-md font-bold text-900 mb-3" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Status Breakdown</h5>
            <div className="flex align-items-center gap-4">
              <div style={{ width: '6.5rem', height: '6.5rem', transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f8f9ff" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--primary-color)" strokeWidth="4" strokeDasharray={`${successPercentage} 100`} />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5eeff" strokeWidth="4" strokeDasharray={`${othersPercentage} 100`} strokeDashoffset={`-${successPercentage}`} />
                </svg>
              </div>
              <div className="flex flex-column gap-2">
                <div className="flex align-items-center gap-2">
                  <span className="border-circle" style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)' }}></span>
                  <span className="text-sm font-semibold text-900">{successPercentage}% Success</span>
                </div>
                <div className="flex align-items-center gap-2">
                  <span className="border-circle" style={{ width: '8px', height: '8px', backgroundColor: '#e5eeff' }}></span>
                  <span className="text-sm text-500 font-medium">{othersPercentage}% Others</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Progress Bar */}
          <div className="card p-4" style={{ border: '1px solid var(--surface-border)' }}>
            <h5 className="m-0 text-md font-bold text-900 mb-3" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Target Progress</h5>
            <div className="flex flex-column mb-1">
              <div className="flex justify-content-between text-xs font-semibold mb-2">
                <span className="text-500">Monthly Goal</span>
                <span className="text-primary font-bold">{successPercentage}%</span>
              </div>
              <div className="w-full" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e5eeff', overflow: 'hidden' }}>
                <div className="h-full" style={{ width: `${successPercentage}%`, backgroundColor: 'var(--primary-color)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Grid Section (Recent Appointments, Payout Requests, & Live Programs Hub) */}
      <div className="grid">
        {/* Tables Left Column */}
        <div className="col-12 lg:col-8 flex flex-column gap-4">
          {/* Recent Appointments Table */}
          <div className="card p-0 overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
            <div className="px-4 py-3 flex justify-content-between align-items-center" style={{ backgroundColor: '#F9FBFC', borderBottom: '1px solid var(--surface-border)' }}>
              <h5 className="m-0 text-md font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Recent Appointments</h5>
              <button className="p-link text-sm font-bold text-primary" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>View all</button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FBFC', borderBottom: '1px solid var(--surface-border)' }}>
                    <th className="p-3 text-xs font-bold text-500 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>Time</th>
                    <th className="p-3 text-xs font-bold text-500 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>Patient</th>
                    <th className="p-3 text-xs font-bold text-500 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>Doctor</th>
                    <th className="p-3 text-xs font-bold text-500 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff' }}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-500 font-medium">Loading appointments...</td>
                    </tr>
                  ) : data?.appointmentDataForTable && data.appointmentDataForTable.length > 0 ? (
                    data.appointmentDataForTable.slice(0, 3).map((item: any) => (
                      <tr key={item.id} className="hover:surface-100 transition-colors" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <td className="p-3 text-sm text-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {format(new Date(item.startingTime), 'HH:mm')}
                        </td>
                        <td className="p-3 text-sm font-bold text-900">{item.patient.firstName}</td>
                        <td className="p-3 text-sm text-600">Dr. {item.professionalUser.firstName}</td>
                        <td className="p-3">
                          <span className="inline-flex align-items-center px-2 py-0.5 border-round text-xs font-bold uppercase" style={{ backgroundColor: 'rgba(0, 137, 143, 0.1)', color: 'var(--primary-color)' }}>
                            Success
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-500 font-medium">No appointments found in range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payout Requests list */}
          <div className="card p-0 overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
            <div className="px-4 py-3 flex justify-content-between align-items-center" style={{ backgroundColor: '#F9FBFC', borderBottom: '1px solid var(--surface-border)' }}>
              <h5 className="m-0 text-md font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Payout Requests</h5>
              <button className="p-link text-sm font-bold text-primary" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>View all</button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <tbody style={{ backgroundColor: '#ffffff' }}>
                  {initialPayouts && initialPayouts.length > 0 ? (
                    initialPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:surface-100 transition-colors" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <td className="p-3 text-sm text-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {format(new Date(payout.createdAt), 'MMM dd')}
                        </td>
                        <td className="p-3 text-sm font-bold text-900">Dr. {payout.doctor.firstName} {payout.doctor.lastName}</td>
                        <td className="p-3 text-sm font-bold text-900">₹{(payout.amountInCents / 100).toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex align-items-center justify-content-end gap-2">
                            <span className="inline-flex align-items-center px-2 py-0.5 border-round text-xs font-bold uppercase mr-2" style={{ backgroundColor: payout.status === 'PAID' ? 'rgba(0, 137, 143, 0.1)' : 'rgba(239, 244, 255, 1)', color: payout.status === 'PAID' ? 'var(--primary-color)' : 'var(--text-color-secondary)' }}>
                              {payout.status}
                            </span>
                            <button className="p-button p-button-sm p-py-1 p-px-2" style={{ backgroundColor: 'var(--primary-color)', border: 'none', color: '#ffffff', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Approve</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-500 font-medium">No recent payouts requests.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Programs Sidebar Hub */}
        <div className="col-12 lg:col-4">
          <div className="card p-0 overflow-hidden flex flex-column h-full" style={{ border: '1px solid var(--surface-border)' }}>
            <div className="px-4 py-3 flex justify-content-between align-items-center" style={{ backgroundColor: '#F9FBFC', borderBottom: '1px solid var(--surface-border)' }}>
              <h5 className="m-0 text-md font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Live Programs</h5>
              <button className="p-link text-sm font-bold text-primary" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Hub</button>
            </div>
            <div className="p-3 flex flex-column gap-3">
              {initialSessions && initialSessions.length > 0 ? (
                initialSessions.map((session, index) => {
                  const isFirst = index === 0;
                  return isFirst ? (
                    <div key={session.id} className="p-3 border-round-lg flex flex-column gap-2" style={{ backgroundColor: 'rgba(0, 137, 143, 0.05)' }}>
                      <div className="flex align-items-center gap-2">
                        <span className="border-circle" style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)' }}></span>
                        <span className="text-xs font-bold text-primary uppercase" style={{ letterSpacing: '0.05em' }}>Live Now</span>
                      </div>
                      <h6 className="m-0 text-sm font-bold text-900 leading-snug">{session.title}</h6>
                      <p className="m-0 text-xs text-500 font-semibold">Scheduled: {format(new Date(session.startAt), 'HH:mm')}</p>
                      {session.meetingLink && (
                        <a href={session.meetingLink} target="_blank" rel="noreferrer" className="w-full text-center p-2 mt-1 no-underline text-white font-bold" style={{ backgroundColor: 'var(--primary-color)', borderRadius: '6px', fontSize: '12px' }}>
                          Join Session
                        </a>
                      )}
                    </div>
                  ) : (
                    <div key={session.id} className="p-3 border-round-lg flex flex-column gap-1" style={{ backgroundColor: '#F9FBFC', border: '1px solid var(--surface-border)' }}>
                      <div className="flex justify-content-between align-items-start">
                        <h6 className="m-0 text-sm font-bold text-900 truncate" style={{ maxWidth: '75%' }}>{session.title}</h6>
                        <span className="text-xs text-500 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {format(new Date(session.startAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="m-0 text-xs text-500 font-semibold mb-2">Price: ₹{session.price}</p>
                      <button className="w-full p-button p-button-outlined p-button-sm p-2" style={{ backgroundColor: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Details</button>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-500 font-medium">No live programs scheduled today.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
