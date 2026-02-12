"use client";
import { Button } from "@repo/ui/src/@/components/button";
import { ShewellButton } from "~/components/ui";
import React, { useEffect, useState } from "react";
import DatePickerWithRange from "./date-range-picker";
import EditAvailability from "../appointment/add-unavailability";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import DashboardCard from "./dashboard-card";
import VacantAndBookedSlots from "./vacant-and-booked-slots";
import DashboardPieChart from "./visitor-analytics";
import VisitorAnalytics from "./visitor-analytics";
import Appointment from "./appointment";
import Balance from "./balance";
import PayoutHistory from "./payout-history";
import DashboardDataTable from "./dashboard-data-table";
import DashboardNotification from "./dashboard-notifications";
// import { DateRange } from "react-day-picker";
import { api } from "~/trpc/react";

import Link from "next/link";

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

  const handleDatesFromDateRange = (data: IDateRange) => {
    setSelectedDates(data);
    console.log(
      "dateInDashboardWhileSelecting",
      data,
      "selected Date",
      selectedDates?.from,
    );
  };

  const { data, refetch: refetchOnlineAppointments } =
    api.noOfOnlineAppointments.noOfOnlineAppointments.useQuery({
      startDate: selectedDates?.from!,
      endDate: selectedDates?.to!,
    });
  // useEffect(() => {
  //   refetchOnlineAppointments();
  // }, [selectedDates]);

  useEffect(() => {
    if (selectedDates) {
      refetchOnlineAppointments();
    }
  }, [selectedDates, refetchOnlineAppointments]);

  const tableValues = data?.appointmentDataForTable.map((item) => ({
    id: item.id,
    patientName: item.patient.firstName,
    patientEmail: item.patient.email,
    bookingDate: new Date(item.startingTime),
    startingTime: new Date(item.startingTime),
    endingTime: new Date(item.endingTime),
    doctorSpecialicity:
      item.professionalUser.displayQualification?.specialization,
  }));
  console.log("parent categories", data?.parentCategories)
  console.log("appointment with parent categories", data?.appointmentWithParentCategories)
  console.log('tableValues', tableValues)
  console.log('specializationParentCategories', data?.specializationParentCategory)

  console.log("data", data);
  const changeInNoOfOnlineAppointments =
    data &&
    data.onlineAppointments.length - data.totalOnlineAppointments.length;

  const changeInPercentageInNoOfOnlineAppointments =
    changeInNoOfOnlineAppointments &&
    changeInNoOfOnlineAppointments / data.totalOnlineAppointments.length;

  const changeInNoOfSatisfiedPatients =
    data &&
    data.noOfSatisfiedPatientsForDateRange.length -
    data.totalNoOfSatisfiedPatients.length;

  const changeInPercentageInNoOfSatisfiedPatients =
    changeInNoOfSatisfiedPatients &&
    changeInNoOfSatisfiedPatients / data.totalNoOfSatisfiedPatients.length;

  const percentageOfNoOfSatisfiedPatients =
    data &&
    data.noOfSatisfiedPatientsForDateRange.length /
    data.totalNoOfSatisfiedPatients.length;

  const doctorProfitDateRange = data?.doctorProfitForDateRange._sum.doctorShareInCents ?? 0;
  const doctorProfitTotal = data?.doctorTotalProfit._sum.doctorShareInCents ?? 0;

  const changeInProfit = doctorProfitDateRange / 100 - doctorProfitTotal / 100;

  const changeInPercentageInProfit =
    doctorProfitTotal > 0 ? (changeInProfit / (doctorProfitTotal / 100)) : 0;

  const percentageOfProfit =
    doctorProfitTotal > 0 ? (doctorProfitDateRange / doctorProfitTotal) : 0;

  const cards = [
    {
      title: "Online Appointments",
      bgColor: "#E0E7FF",
      borderColor: "#F6F9FF",
      change:
        (changeInPercentageInNoOfOnlineAppointments &&
          changeInPercentageInNoOfOnlineAppointments * 100) ||
        0,
      number: (data && data.onlineAppointments.length) || 0,
      percentage: 100,
    },
    {
      title: "Pending Appointments",
      bgColor: "#FFF3ED",
      borderColor: "#FFEDD5",
      change:   (0),
      number: tableValues?.length || 0,
      percentage: 0,
    },
    {
      title: "Satisfied Patients",
      bgColor: "#FFFDED",
      borderColor: "#FEF9C3",
      change:
        (changeInPercentageInNoOfSatisfiedPatients &&
          changeInPercentageInNoOfSatisfiedPatients * 100) ||
        0,
      number: (data && data.noOfSatisfiedPatientsForDateRange.length) || 0,
      percentage:
        (percentageOfNoOfSatisfiedPatients &&
          percentageOfNoOfSatisfiedPatients * 100) ||
        0,
    },
    // {
    //   title: "Online Appointments",
    //   bgColor: "#F2FFED",
    //   borderColor: "#E0F2FE",
    //   change: 3,
    //   number: 459,
    //   percentage: 80,
    // },
    {
      title: "Total Profit",
      bgColor: "#F6FBFF",
      borderColor: "#E0F2FE",
      change:
        (changeInPercentageInProfit && changeInPercentageInProfit * 100) || 0,
      number: Math.round(doctorProfitTotal / 100),
      percentage: (percentageOfProfit && percentageOfProfit * 100) || 0,
    },
  ];

  const totalAppointments = data && data.totalAppointmentsWithoutAnyStatus && data.totalAppointmentsWithoutAnyStatus.length.toString()
  const onlineAppointments = data && data.totalAppointmentsWithoutAnyStatus && data.totalAppointmentsWithoutAnyStatus.length.toString()
  const completedAppointments = data && data.totalOnlineAppointments.length.toString()
  const appointments = [
    {
      title: "Total Appointments",
      noOfAppointments: totalAppointments,
      value: 100,
      color: "#F59E0B",
      mainColor: "bg-[#F59E0B]",
      backgroundColor: "bg-[#FEF3C7]",
    },
    {
      title: "Offline Appointments",
      noOfAppointments: "0",
      value: 0,
      color: "#2563EB",
      mainColor: "bg-[#2563EB]",
      backgroundColor: "bg-[#BFDBFE]",
    },
    {
      title: "Online Appointments",
      noOfAppointments: onlineAppointments,
      value: ((parseInt(totalAppointments!) - 0) / parseInt(totalAppointments!)) * 100,
      color: "#059669",
      mainColor: "bg-[#059669]",
      backgroundColor: "bg-[#A7F3D0]",
    },
    {
      title: "Completed Appointments",
      noOfAppointments: data && data.totalOnlineAppointments && data.totalOnlineAppointments.length.toString(),
      value: (parseInt(completedAppointments!) / parseInt(totalAppointments!)) * 100,
      color: "#4338CA",
      mainColor: "bg-[#4338CA]",
      backgroundColor: "bg-[#E0E7FF]",
    },
  ];

  console.log("table values", tableValues);
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
      {/* buttons */}
      {/* <div className="flex justify-center gap-2 sm:justify-end sm:gap-3 md:gap-4 lg:gap-6">
        <ShewellButton
          variant="medium"
          href="/doctor-profile"
          className="bg-white text-gray-700 hover:bg-gray-100"
          withIcon={false}
        >
          <svg
            className="mr-1 inline w-5 h-5"
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4616_30594)">
              <path
                d="M19.6757 9.30851C18.5533 7.86933 17.0993 6.6789 15.4712 5.86601C13.8091 5.03621 12.0211 4.60566 10.1546 4.58309C10.1032 4.58168 9.8968 4.58168 9.84539 4.58309C7.97891 4.6057 6.19087 5.03621 4.52884 5.86601C2.90068 6.6789 1.44681 7.86929 0.324316 9.30851C-0.108105 9.86292 -0.108105 10.6373 0.324316 11.1917C1.44677 12.6309 2.90068 13.8214 4.52884 14.6342C6.19087 15.464 7.97887 15.8946 9.84539 15.9172C9.8968 15.9186 10.1032 15.9186 10.1546 15.9172C12.0211 15.8945 13.8091 15.464 15.4712 14.6342C17.0993 13.8214 18.5532 12.631 19.6757 11.1917C20.1081 10.6373 20.1081 9.86292 19.6757 9.30851ZM4.89231 13.9063C3.37201 13.1473 2.01427 12.0355 0.965877 10.6914C0.76326 10.4316 0.76326 10.0687 0.965877 9.8089C2.01423 8.46472 3.37197 7.353 4.89231 6.59394C5.32411 6.37839 5.76505 6.19199 6.21415 6.03418C5.05876 7.07277 4.33083 8.57792 4.33083 10.2501C4.33083 11.9224 5.0588 13.4276 6.2143 14.4662C5.7652 14.3084 5.32415 14.1219 4.89231 13.9063ZM10 15.1057C7.32262 15.1057 5.14442 12.9275 5.14442 10.2501C5.14442 7.57265 7.32262 5.39449 10 5.39449C12.6775 5.39449 14.8557 7.57269 14.8557 10.2501C14.8557 12.9275 12.6775 15.1057 10 15.1057ZM19.0342 10.6913C17.9858 12.0355 16.6281 13.1472 15.1078 13.9063C14.6765 14.1216 14.2358 14.3072 13.7873 14.4648C14.9419 13.4263 15.6692 11.9216 15.6692 10.2501C15.6692 8.57765 14.9411 7.0723 13.7855 6.03371C14.2348 6.19156 14.6759 6.3782 15.1078 6.59386C16.6281 7.35292 17.9858 8.46464 19.0342 9.80882C19.2368 10.0687 19.2368 10.4315 19.0342 10.6913Z"
                fill="currentColor"
              />
              <path
                d="M9.9998 8.17188C8.85402 8.17188 7.92188 9.10402 7.92188 10.2498C7.92188 11.3956 8.85402 12.3277 9.9998 12.3277C11.1456 12.3277 12.0777 11.3956 12.0777 10.2498C12.0778 9.10402 11.1456 8.17188 9.9998 8.17188ZM9.9998 11.5142C9.30265 11.5142 8.73543 10.947 8.73543 10.2498C8.73543 9.55261 9.30258 8.98547 9.9998 8.98547C10.6969 8.98547 11.2641 9.55261 11.2641 10.2498C11.2642 10.947 10.6969 11.5142 9.9998 11.5142Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="clip0_4616_30594">
                <rect
                  width="20"
                  height="20"
                  fill="white"
                  transform="translate(0 0.25)"
                />
              </clipPath>
            </defs>
          </svg>
          Preview
        </ShewellButton>
        <ShewellButton
          variant="medium"
          href="/edit-profile/personal-info"
        >
          <svg
            className="mr-1 inline w-5 h-5"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.0938 18.2725H19.2756H11.0938Z" fill="white" />
            <path
              d="M11.0938 18.2725H19.2756"
              stroke="white"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.1868 3.27284C15.5484 2.91119 16.039 2.70801 16.5504 2.70801C16.8037 2.70801 17.0544 2.75789 17.2884 2.8548C17.5224 2.95172 17.735 3.09377 17.9141 3.27284C18.0931 3.45192 18.2352 3.66451 18.3321 3.89849C18.429 4.13246 18.4789 4.38323 18.4789 4.63648C18.4789 4.88973 18.429 5.1405 18.3321 5.37448C18.2352 5.60845 18.0931 5.82104 17.9141 6.00012L6.55043 17.3638L2.91406 18.2728L3.82315 14.6365L15.1868 3.27284Z"
              stroke="white"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Edit Profile
        </ShewellButton>
      </div> */}

      {/* add-availability , date-picker and drop-down */}
      <div className="my-6 flex flex-wrap xs:gap-[20px] md:my-9 md:justify-between lg:my-10">
        {/* add-availability and date */}
        <div className="flex flex-wrap gap-[20px]">
          {/*date*/}
          <div>
            <DatePickerWithRange
              selectedDates={selectedDates}
              sendDatesToDashboardContent={handleDatesFromDateRange}
            />
          </div>
          {/* add-availability */}
          <div>{/* <EditAvailability /> */}</div>
        </div>
        {/* dropdown */}
        {/* <div>
          <Select>
            <SelectTrigger className="w-[89px]">
              <SelectValue className="text-[14px]" placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="bg-white ">
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* Dashboard Cards */}
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {cards.map((item, index) => {
          return (
            <DashboardCard
              key={index}
              title={item.title}
              bgColor={item.bgColor}
              borderColor={item.borderColor}
              change={item.change}
              number={item.number}
              percentage={item.percentage}
            // incrementInOnlineAppointment={item.incrementInOnlineAppointment}
            />
          );
        })}
      </div>

      {/* Analytics Grid - Responsive layout that adapts automatically */}
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <VisitorAnalytics />
        <VacantAndBookedSlots />
      </div>

      {/* Secondary Stats Grid */}
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
         {/* <Appointment appointments={appointments} /> */}
        <PayoutHistory />
        <Balance />
        <DashboardNotification notifications={data?.notifications} />
      </div>

      {/* Appointments Table */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        {tableValues && <DashboardDataTable tableValue={tableValues} />}
      </div>
    </div>
  );
};

export default DashboardContent;
