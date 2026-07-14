'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chart } from 'primereact/chart';
import { format } from 'date-fns';
import { apiClient } from '@/src/trpc/react';
import DateRangeForAppointmentData from './date-range-for-appointment-data';
import useToastContext from '@/src/_hooks/useToast';
import { updateSessionDetails, approvePayout } from '@/src/app/(main)/manage-sessions/sessions/session-actions';
import uploadProductImage from '@/src/app/(main)/upload-image-actions';
import { env } from '@/src/env.js';

interface SerializedSession {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  price: number;
  meetingLink: string;
  maxBookings?: number | null;
  overview?: string | null;
  thumbnailMedia?: { id: string; fileUrl: string | null } | null;
  banners?: { id: string; fileUrl: string | null }[];
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
  const router = useRouter();
  const { showToast } = useToastContext();

  // Current time state updated every 10 seconds for dynamic live check
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Popup / Modal State
  const [selectedSession, setSelectedSession] = useState<SerializedSession | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [maxBookings, setMaxBookings] = useState<string>('');
  const [overview, setOverview] = useState('');
  const [thumbnailMedia, setThumbnailMedia] = useState<{ id: string; fileUrl: string | null } | null>(null);
  const [banners, setBanners] = useState<{ id: string; fileUrl: string | null }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleOpenManage = (session: SerializedSession) => {
    setSelectedSession(session);
    setMeetingLink(session.meetingLink || '');
    setMaxBookings(session.maxBookings !== null && session.maxBookings !== undefined ? String(session.maxBookings) : '');
    setOverview(session.overview || '');
    setThumbnailMedia(session.thumbnailMedia || null);
    setBanners(session.banners || []);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const resp = await uploadProductImage(file.name, file.type, 'Session Thumbnail');
      if (resp.error) {
        showToast('error', 'Error', resp.error);
        return;
      }
      const { id, fileUrl, presignedUrl } = resp;
      if (!presignedUrl || !id || !fileUrl) {
        throw new Error('Failed to get upload URL');
      }

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      setThumbnailMedia({ id, fileUrl });
      showToast('success', 'Success', 'Thumbnail uploaded successfully');
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Error', err.message || 'Failed to upload thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (banners.length + files.length > 2) {
      showToast('error', 'Error', 'Maximum 2 banners allowed');
      return;
    }

    setIsUploadingBanner(true);
    try {
      const newBanners = [...banners];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const resp = await uploadProductImage(file.name, file.type, 'Session Banner');
        if (resp.error) {
          showToast('error', 'Error', resp.error);
          continue;
        }
        const { id, fileUrl, presignedUrl } = resp;
        if (!presignedUrl || !id || !fileUrl) continue;

        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        newBanners.push({ id, fileUrl });
      }
      setBanners(newBanners);
      showToast('success', 'Success', 'Banners uploaded successfully');
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Error', err.message || 'Failed to upload banners');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedSession) return;
    setIsSaving(true);
    try {
      const bookingsVal = maxBookings.trim();
      const maxBookingsNum = bookingsVal ? parseInt(bookingsVal, 10) : null;
      if (bookingsVal && (isNaN(maxBookingsNum as any) || (maxBookingsNum as number) < 0)) {
        showToast('error', 'Error', 'Max Bookings must be a non-negative number');
        setIsSaving(false);
        return;
      }

      const result = await updateSessionDetails({
        id: selectedSession.id,
        meetingLink: meetingLink || null,
        maxBookings: maxBookingsNum,
        overview: overview || null,
        thumbnailMediaId: thumbnailMedia?.id || null,
        bannerMediaIds: banners.map(b => b.id)
      });

      if (result.error) {
        showToast('error', 'Error', result.error);
      } else {
        showToast('success', 'Success', 'Session updated successfully');
        setSelectedSession(null);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Error', 'Failed to update session');
    } finally {
      setIsSaving(false);
    }
  };

  // Payout approval state
  const [approvingPayoutId, setApprovingPayoutId] = useState<string | null>(null);

  const handleApprovePayout = async (payoutId: string) => {
    setApprovingPayoutId(payoutId);
    try {
      const result = await approvePayout(payoutId);
      if (result.error) {
        showToast('error', 'Error', result.error);
      } else {
        showToast('success', 'Success', 'Payout approved successfully');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to approve payout');
    } finally {
      setApprovingPayoutId(null);
    }
  };

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
    if (!startDate || !endDate) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#40484b';
    const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#00898f';

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let bucketDates: Date[] = [];
    let labels: string[] = [];
    let counts: number[] = [];

    if (diffDays <= 31) {
      // Daily buckets
      const curr = new Date(start);
      while (curr <= end) {
        bucketDates.push(new Date(curr));
        labels.push(format(curr, 'MMM dd'));
        counts.push(0);
        curr.setDate(curr.getDate() + 1);
      }

      if (data?.appointmentDataForTable) {
        data.appointmentDataForTable.forEach((apt: any) => {
          const aptDate = new Date(apt.startingTime);
          for (let i = 0; i < bucketDates.length; i++) {
            const b = bucketDates[i];
            if (
              aptDate.getFullYear() === b.getFullYear() &&
              aptDate.getMonth() === b.getMonth() &&
              aptDate.getDate() === b.getDate()
            ) {
              counts[i]++;
              break;
            }
          }
        });
      }
    } else if (diffDays <= 120) {
      // Weekly buckets
      const curr = new Date(start);
      while (curr <= end) {
        bucketDates.push(new Date(curr));
        labels.push(format(curr, 'MMM dd'));
        counts.push(0);
        curr.setDate(curr.getDate() + 7);
      }

      if (data?.appointmentDataForTable) {
        data.appointmentDataForTable.forEach((apt: any) => {
          const aptTime = new Date(apt.startingTime).getTime();
          for (let i = 0; i < bucketDates.length; i++) {
            const bTime = bucketDates[i].getTime();
            const nextBTime = i < bucketDates.length - 1 ? bucketDates[i + 1].getTime() : end.getTime() + 1;
            if (aptTime >= bTime && aptTime < nextBTime) {
              counts[i]++;
              break;
            }
          }
        });
      }
    } else {
      // Monthly buckets
      const curr = new Date(start);
      curr.setDate(1);

      while (curr <= end) {
        bucketDates.push(new Date(curr));
        labels.push(format(curr, 'MMM yy'));
        counts.push(0);
        curr.setMonth(curr.getMonth() + 1);
      }

      if (data?.appointmentDataForTable) {
        data.appointmentDataForTable.forEach((apt: any) => {
          const aptDate = new Date(apt.startingTime);
          for (let i = 0; i < bucketDates.length; i++) {
            const b = bucketDates[i];
            if (
              aptDate.getFullYear() === b.getFullYear() &&
              aptDate.getMonth() === b.getMonth()
            ) {
              counts[i]++;
              break;
            }
          }
        });
      }
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
          ticks: {
            color: textColorSecondary,
            font: { family: 'Inter', size: 12 },
            precision: 0
          },
          min: 0,
          suggestedMax: 5
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

  // Dynamic calculations for Reviews
  const databaseReviews = data?.reviews || [];
  const totalReviews = databaseReviews.length;

  let averageRating = '0.0';
  let positivePercentage = 0;
  let neutralPercentage = 0;
  let needsAttentionPercentage = 0;

  if (totalReviews > 0) {
    const ratings = databaseReviews.map((r: any) => parseFloat(r.rating)).filter((r: any) => !isNaN(r));
    if (ratings.length > 0) {
      averageRating = (ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length).toFixed(1);

      const positiveCount = ratings.filter((r: number) => r >= 4).length;
      const neutralCount = ratings.filter((r: number) => r === 3).length;
      const needsAttentionCount = ratings.filter((r: number) => r <= 2).length;

      positivePercentage = Math.round((positiveCount / ratings.length) * 100);
      neutralPercentage = Math.round((neutralCount / ratings.length) * 100);
      needsAttentionPercentage = Math.round((needsAttentionCount / ratings.length) * 100);

      const sum = positivePercentage + neutralPercentage + needsAttentionPercentage;
      if (sum > 0 && sum !== 100) {
        positivePercentage += (100 - sum);
      }
    }
  }

  // Dynamic calculations for Payout Details
  const databasePayouts = data?.payouts || [];
  let totalVolume = 0;
  let disbursedAmount = 0;
  let pendingAmount = 0;

  if (databasePayouts.length > 0) {
    totalVolume = databasePayouts.reduce((sum: number, p: any) => sum + p.amountInCents, 0) / 100;
    disbursedAmount = databasePayouts.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + p.amountInCents, 0) / 100;
    pendingAmount = databasePayouts.filter((p: any) => p.status === 'INITIATED' || p.status === 'PROCESSING').reduce((sum: number, p: any) => sum + p.amountInCents, 0) / 100;
  }

  const disbursementRatio = totalVolume > 0 ? Math.round((disbursedAmount / totalVolume) * 100) : 0;
  const remainingRatio = totalVolume > 0 ? 100 - disbursementRatio : 0;

  // Currency Formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Lakhs formatter for high values
  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="flex flex-col space-y-md w-full">
      {/* 1. Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">System status overview</p>
        </div>
        <div className="flex items-center gap-sm">
          <DateRangeForAppointmentData />
          <button className="bg-primary text-white rounded px-sm py-2 flex items-center gap-xs hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            <span className="font-body-sm text-body-sm font-bold">Export</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter" style={{ display: 'grid' }}>
        {/* Appointments Today */}
        <div className="card-subtle p-md rounded flex items-center gap-md">
          <div className="w-[48px] h-[48px] shrink-0 bg-surface-container rounded flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Appointments</p>
            <div className="flex items-baseline">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {isLoading ? '...' : totalAppointments}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="card-subtle p-md rounded flex items-center gap-md">
          <div className="w-[48px] h-[48px] shrink-0 bg-surface-container rounded flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Revenue</p>
            <div className="flex items-baseline">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {isLoading ? '...' : formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Patients */}
        <div className="card-subtle p-md rounded flex items-center gap-md">
          <div className="w-[48px] h-[48px] shrink-0 bg-surface-container rounded flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Total Patients</p>
            <div className="flex items-baseline">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {isLoading ? '...' : (newUsersCount >= 1000 ? `${(newUsersCount / 1000).toFixed(1)}k` : newUsersCount)}
              </span>
            </div>
          </div>
        </div>

        {/* Active Doctors */}
        <div className="card-subtle p-md rounded flex items-center gap-md">
          <div className="w-[48px] h-[48px] shrink-0 bg-surface-container rounded flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">medical_information</span>
          </div>
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Active Doctors</p>
            <div className="flex items-baseline">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {isLoading ? '...' : totalDoctors}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter" style={{ display: 'grid' }}>
        {/* Trend Chart (lg:col-span-8) */}
        <div className="lg:col-span-8 card-subtle p-md rounded flex flex-col h-full">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Appointment Trend</h3>

          </div>
          <div className="flex-grow w-full min-h-[256px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-on-surface-variant/60 font-medium">Loading chart data...</div>
            ) : (
              <Chart type="line" data={chartData} options={chartOptions} className="w-full h-full" style={{ height: '100%', width: '100%' }} />
            )}
          </div>
        </div>

        {/* Metrics Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Patient Review Widget */}
          <div className="card-subtle p-md rounded">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Patient Review</h3>

            </div>
            <div className="space-y-md">
              <div>
                <div className="flex items-baseline gap-xs">
                  <span className="text-headline-md font-bold text-on-surface">{averageRating}</span>
                  <span className="text-on-surface-variant/60 text-body-sm">/5.0</span>
                </div>
                <p className="text-[11px] text-on-surface-variant/50">Based on {totalReviews} reviews</p>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <span className="w-[8px] h-[8px] shrink-0 rounded-full bg-primary"></span>
                    <span className="text-body-sm text-on-surface">Positive</span>
                  </div>
                  <span className="font-data-mono text-body-sm font-bold">{positivePercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <span className="w-[8px] h-[8px] shrink-0 rounded-full bg-surface-container-high"></span>
                    <span className="text-body-sm text-on-surface-variant">Neutral</span>
                  </div>
                  <span className="font-data-mono text-body-sm">{neutralPercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <span className="w-[8px] h-[8px] shrink-0 rounded-full bg-error"></span>
                    <span className="text-body-sm text-on-surface-variant">Needs Attention</span>
                  </div>
                  <span className="font-data-mono text-body-sm text-error">{needsAttentionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Details Widget */}
          <div className="card-subtle p-md rounded">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Payout details</h3>
              <Link href="/manage-payouts" className="text-primary text-body-sm font-bold no-underline hover:underline">View all</Link>
            </div>
            <div className="space-y-md">
              <div>
                <div className="flex items-baseline gap-xs">
                  <span className="text-headline-md font-bold text-on-surface">{formatLakhs(totalVolume)}</span>
                  <span className="text-on-surface-variant/60 text-body-sm ml-1">Total Volume</span>
                </div>
                <p className="text-[11px] text-on-surface-variant/50">Combined payout activity</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface-variant">Disbursement Ratio</span>
                  <span className="font-bold text-primary">{disbursementRatio}%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: `${disbursementRatio}%` }}></div>
                  <div className="bg-surface-container-high h-full" style={{ width: `${remainingRatio}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-container">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase font-label-caps">Disbursed</span>
                  <span className="text-body-sm font-bold text-on-surface">{formatLakhs(disbursedAmount)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-on-surface-variant/60 uppercase font-label-caps">Pending</span>
                  <span className="text-body-sm font-bold text-on-surface">{formatLakhs(pendingAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tables & Hub Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter" style={{ display: 'grid' }}>
        {/* Recent Appointments & Payout Requests Tables */}
        <div className="lg:col-span-8 space-y-gutter">
          {/* Recent Appointments Table */}
          <div className="card-subtle rounded overflow-hidden">
            <div className="px-md py-4 flex justify-between items-center bg-surface-card border-b border-surface-border">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Appointments</h3>
              <Link href="/view-doctors/appointments" className="text-primary text-body-sm font-bold no-underline hover:underline">View all</Link>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <tr>
                  <th className="p-md font-label-caps text-[10px] text-on-surface-variant uppercase">Time</th>
                  <th className="p-md font-label-caps text-[10px] text-on-surface-variant uppercase">Patient</th>
                  <th className="p-md font-label-caps text-[10px] text-on-surface-variant uppercase">Doctor</th>
                  <th className="p-md font-label-caps text-[10px] text-on-surface-variant uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/50 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-md text-center text-on-surface-variant">Loading appointments...</td>
                  </tr>
                ) : data?.appointmentDataForTable && data.appointmentDataForTable.length > 0 ? (
                  data.appointmentDataForTable.slice(0, 2).map((item: any) => (
                    <tr key={item.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="p-md font-data-mono text-on-surface">
                        {format(new Date(item.startingTime), 'HH:mm')}
                      </td>
                      <td className="p-md font-body-md font-semibold">{item.patient?.firstName || 'John Doe'}</td>
                      <td className="p-md text-on-surface-variant">Dr. {item.professionalUser?.firstName || 'Lee'}</td>
                      <td className="p-md">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Success</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-md text-center text-on-surface-variant">
                      No appointments found for this date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payout Requests List */}
          <div className="card-subtle rounded overflow-hidden">
            <div className="px-md py-4 flex justify-between items-center bg-surface-card border-b border-surface-border">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Payout Requests</h3>
              <Link href="/manage-payouts" className="text-primary text-body-sm font-bold no-underline hover:underline">View all</Link>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-surface-container/50 bg-white">
                {initialPayouts && initialPayouts.length > 0 ? (
                  initialPayouts.slice(0, 3).map((payout) => (
                    <tr key={payout.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="p-md font-data-mono text-on-surface-variant">
                        {format(new Date(payout.createdAt), 'MMM dd')}
                      </td>
                      <td className="p-md font-body-md font-semibold">Dr. {payout.doctor.firstName} {payout.doctor.lastName}</td>
                      <td className="p-md font-bold">{formatCurrency(payout.amountInCents / 100)}</td>
                      <td className="p-md flex justify-end items-center gap-2">
                        {payout.status === 'INITIATED' || payout.status === 'PROCESSING' ? (
                          <>
                            <button
                              onClick={() => handleApprovePayout(payout.id)}
                              disabled={approvingPayoutId === payout.id}
                              className="bg-primary text-white px-3 py-1 rounded text-[11px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {approvingPayoutId === payout.id ? 'Approving...' : 'Approve'}
                            </button>
                            <a
                              href="/manage-payouts"
                              className="bg-surface-container text-on-surface-variant px-3 py-1 rounded text-[11px] font-bold hover:bg-surface-container-high transition-colors no-underline"
                            >
                              Review
                            </a>
                          </>
                        ) : payout.status === 'PAID' ? (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Paid</span>
                        ) : payout.status === 'FAILED' ? (
                          <span className="px-2 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold uppercase">Failed</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase">{payout.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-md text-center text-on-surface-variant">
                      No payout requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Sessions Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <div className="card-subtle rounded flex flex-col h-full overflow-hidden">
            <div className="px-md py-4 flex justify-between items-center bg-surface-card border-b border-surface-border">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Upcoming Sessions</h3>
              <Link href="/manage-sessions/sessions" className="text-primary text-body-sm font-bold no-underline hover:underline">View all</Link>
            </div>
            <div className="p-md space-y-4">
              {initialSessions && initialSessions.length > 0 ? (
                initialSessions.map((session) => {
                  const isOngoing = now >= new Date(session.startAt) && now <= new Date(session.endAt);
                  return isOngoing ? (
                    /* Live Session Card */
                    <div key={session.id} className="p-sm bg-primary/5 border border-primary/10 rounded space-y-3">
                      <div className="flex justify-between items-start">
                        <h5 className="font-headline-sm text-[16px] font-bold leading-snug text-on-surface">
                          {session.title}
                        </h5>
                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                          <span className="w-[6px] h-[6px] shrink-0 bg-primary rounded-full animate-pulse"></span>
                          <span className="text-[10px] font-bold text-primary uppercase">Live</span>
                        </div>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        {session.price > 0 ? `Paid Session (${formatCurrency(session.price)})` : 'Free Awareness'} • Started at {format(new Date(session.startAt), 'HH:mm')}
                      </p>
                      <div className="flex gap-2">
                        {session.meetingLink ? (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-primary text-white py-2 rounded font-bold text-body-sm text-center no-underline hover:opacity-90 transition-opacity"
                          >
                            Join Now
                          </a>
                        ) : (
                          <button disabled className="flex-1 bg-primary/50 text-white/80 py-2 rounded font-bold text-body-sm cursor-not-allowed">
                            Join Now
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenManage(session)}
                          className="flex-1 border border-primary text-primary py-2 rounded font-bold text-body-sm hover:bg-primary/5 transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Upcoming Sessions List */
                    <div key={session.id} className="p-sm bg-surface-container/30 rounded space-y-3">
                      <div className="flex justify-between items-start">
                        <h5 className="font-headline-sm text-[16px] font-bold leading-snug text-on-surface">
                          {session.title}
                        </h5>
                        <span className="text-[11px] font-data-mono text-on-surface-variant">
                          {format(new Date(session.startAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        {session.price > 0 ? `Paid Session (${formatCurrency(session.price)})` : 'Free Awareness'}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={`${env.NEXT_PUBLIC_USER}/session/${session.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-surface-container-high text-on-surface py-2 rounded font-bold text-body-sm text-center no-underline hover:bg-surface-container transition-colors"
                        >
                          Open
                        </a>
                        <button
                          onClick={() => handleOpenManage(session)}
                          className="flex-1 border border-primary text-primary py-2 rounded font-bold text-body-sm hover:bg-primary/5 transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-md text-center text-on-surface-variant bg-surface-container/10 rounded border border-dashed border-surface-border">
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 mb-2 block">event_busy</span>
                  <p className="text-body-sm font-medium">No upcoming sessions scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Details / Manage Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          {/* Modal Container */}
          <div className="bg-white w-full max-w-[560px] rounded-2xl modal-shadow overflow-hidden flex flex-col border border-outline-variant/20">
            {/* Header */}
            <div className="px-lg pt-lg pb-md flex items-center justify-between">
              <h2 className="text-[20px] font-headline font-bold text-on-surface">Session Details</h2>
              <button
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="px-lg pb-lg flex flex-col gap-md max-h-[70vh] overflow-y-auto">
              {/* Max Bookings */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-on-surface-variant">Max Bookings</label>
                <input
                  type="number"
                  min="0"
                  value={maxBookings}
                  onChange={(e) => setMaxBookings(e.target.value)}
                  className="custom-input w-full bg-white border border-outline-variant/60 rounded-xl px-4 py-2.5 text-[14px] outline-none placeholder:text-outline-variant"
                  placeholder="Unlimited"
                />
              </div>

              {/* Meeting Link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-on-surface-variant">Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="custom-input w-full bg-white border border-outline-variant/60 rounded-xl px-4 py-2.5 text-[14px] outline-none placeholder:text-outline-variant"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              {/* Overview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-on-surface-variant">Overview</label>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="custom-input w-full bg-white border border-outline-variant/60 rounded-xl px-4 py-2.5 text-[14px] outline-none placeholder:text-outline-variant resize-none"
                  placeholder="Provide a detailed description of the session..."
                  rows={4}
                />
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-2 gap-md">
                {/* Thumbnail */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-on-surface-variant">Thumbnail Image</label>
                  {thumbnailMedia ? (
                    <div className="relative group w-full h-[88px] rounded-xl overflow-hidden border border-outline-variant/60">
                      <img src={thumbnailMedia.fileUrl || ''} className="w-full h-full object-cover" alt="Thumbnail" />
                      <button
                        type="button"
                        onClick={() => setThumbnailMedia(null)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] block">delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                      className="w-full h-[88px] flex flex-col items-center justify-center gap-1.5 border border-dashed border-outline-variant/60 rounded-xl hover:bg-surface/50 hover:border-brand/40 transition-all text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isUploadingThumbnail ? 'hourglass_empty' : 'add_photo_alternate'}
                      </span>
                      <span className="text-[12px] font-medium">
                        {isUploadingThumbnail ? 'Uploading...' : 'Choose Image'}
                      </span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Banners */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-semibold text-on-surface-variant">Banner Images</label>
                    <span className="text-[11px] text-outline">Max 2</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {banners.map((b, idx) => (
                      <div key={b.id || idx} className="relative group w-full h-[88px] rounded-xl overflow-hidden border border-outline-variant/60">
                        <img src={b.fileUrl || ''} className="w-full h-full object-cover" alt={`Banner ${idx + 1}`} />
                        <button
                          type="button"
                          onClick={() => setBanners(banners.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </div>
                    ))}
                    {banners.length < 2 && (
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploadingBanner}
                        className="w-full h-[88px] flex flex-col items-center justify-center gap-1.5 border border-dashed border-outline-variant/60 rounded-xl hover:bg-surface/50 hover:border-brand/40 transition-all text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isUploadingBanner ? 'hourglass_empty' : 'collections'}
                        </span>
                        <span className="text-[12px] font-medium">
                          {isUploadingBanner ? 'Add Banners' : 'Add Banners'}
                        </span>
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-lg py-md bg-surface/50 border-t border-outline-variant/20 flex items-center justify-end gap-sm">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2.5 text-[14px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDetails}
                disabled={isSaving}
                className="px-8 py-2.5 bg-[#00898f] hover:bg-[#007a7f] disabled:bg-[#00898f]/50 text-white text-[14px] font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
