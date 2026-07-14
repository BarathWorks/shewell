'use client';

import { apiClient } from '@/src/trpc/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Card from './card';

const ProductData = () => {
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

  const CARD = [
    { title: 'Products', value: `₹${(data?.productCardAvg._avg.totalInCent || 0).toFixed(2)}`, icon: <i className="pi pi-shopping-cart text-blue-500 text-xl" />, borderColor: 'text-blue-500', iconBg: 'bg-blue-100' },
    { title: 'New Users', value: `${data?.newUsers || 0}`, icon: <i className="pi pi-comment text-purple-500 text-xl" />, borderColor: 'text-purple-500', iconBg: 'bg-purple-100' }
  ];
  return (
    <>
      {CARD.map((item) => {
        return (
          <div className="col-12 md:col-6 lg:col-3 xl:col-3" key={item.title}>
            <Card item={item} />
          </div>
        );
      })}
    </>
  );
};
export default ProductData;
