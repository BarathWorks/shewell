'use client';
import { apiClient } from '@/src/trpc/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Card from './card';

const DoctorsOnBoardForDateRange = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    setStartDate(searchParams.get('startDate') ?? '');
    setEndDate(searchParams.get('endDate') ?? '');
  }, [searchParams]);
  const { data } = apiClient.noOfOnlineAppointments.noOfOnlineAppointments.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  });

  const doctorOnBoardItems = { title: `New Doctors Onboard  (${startDate} to ${endDate})`, value: `${(data?.totalDoctorsOnBoard || 0).toString()}`, icon: <i className="pi pi-comment text-purple-500 text-xl" />, borderColor: 'text-purple-500', iconBg: 'bg-purple-100' };
  const cancelledAppointmentItems = { title: `Cancelled Appointments`, value: `${(data?.cancelledAppointments?._count?.id || 0).toString()}`, icon: <i className="pi pi-comment text-purple-500 text-xl" />, borderColor: 'text-purple-500', iconBg: 'bg-purple-100' };

  
  return (
    <>
      <div className="col-12 md:col-6 lg:col-3 xl:col-3">
        <Card item={cancelledAppointmentItems} />
      </div>
     
    </>
  );
};
export default DoctorsOnBoardForDateRange;
