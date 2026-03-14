'use client'
import { apiClient } from "@/src/trpc/react";
import Card from "./card";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


const TotalDoctorsOnBoard = () => {
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
    const doctorTotalAppointmentsWithCountAndPriceItems = {
        title: 'Total Appointments Count',
        anotherTitle: 'Price',
        anotherValue: `₹${(data?.totalAppointmentsWithCountAndPrice._sum.totalPriceInCents! / 100 || 0)?.toString()}`,
        value: `${(data?.totalAppointmentsWithCountAndPrice._count.id || 0).toString()}`,
        borderColor: 'text-purple-500'
      };
      const doctorOnBoardItems = { title: `Total Doctors Onboard`, value: `${(data?.totalDoctorsOnBoard || 0).toString()}`, icon: <i className="pi pi-comment text-purple-500 text-xl" />, borderColor: 'text-purple-500', iconBg: 'bg-purple-100' };
    return(
        <>
        <div className="col-12 lg:col-6 xl:col-6">
        <Card item={doctorTotalAppointmentsWithCountAndPriceItems} />
      </div>
      <div className="col-12 lg:col-6 xl:col-6">
        <Card item={doctorOnBoardItems} />
      </div>
        </>
    )
}
export default TotalDoctorsOnBoard