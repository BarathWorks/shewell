'use client'
import { format, parse } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';
import { useEffect, useState } from 'react';

const DateRangeForAppointmentData = () => {

    const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const router = useRouter()

 

   // Initialize dates from URL parameters on component mount
   useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (startDate && endDate) {
      const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());
      setDates([parsedStartDate, parsedEndDate]);
    }
  }, [searchParams]);

  const handleDateChange = (e: { value: Nullable<(Date | null)[]> }) => {
    setDates(e.value);
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Update date parameters
    if (e.value?.[0]) {
      params.set('startDate', format(e.value[0], 'yyyy-MM-dd'));
    } else {
      params.delete('startDate');
    }
    
    if (e.value?.[1]) {
      params.set('endDate', format(e.value[1], 'yyyy-MM-dd'));
    } else {
      params.delete('endDate');
    }
    

    // Update URL 
    router.push(`${pathname}?${params.toString()}`);
  };
  

  return (
    <div className="flex align-items-center">
      <Calendar
        value={dates}
        onChange={handleDateChange}
        selectionMode="range"
        className="max-w-[300px]"
        showIcon
        icon="pi pi-calendar"
        dateFormat="yy-mm-dd"
        placeholder="Select Date Range"
        inputStyle={{
          backgroundColor: '#eff4ff',
          border: 'none',
          color: '#40484b',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          borderRadius: '8px 0 0 8px'
        }}
        buttonStyle={{
          backgroundColor: '#eff4ff',
          border: 'none',
          color: '#00898f',
          borderRadius: '0 8px 8px 0'
        }}
      />
    </div>
  );
};
export default DateRangeForAppointmentData;
