"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import DashboardBarChart from "./dashboard-bar-chart";
import { format, getMonth, getYear } from "date-fns";
import { api } from "~/trpc/react";
const VacantAndBookedSlots = () => {
  const months = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" },
  ];

  // Get the current year using date-fns
  const currentYear = getYear(new Date());
  // console.log("currentYear", currentYear);

  // Create an array of objects from 1900 to the current year
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
    const year = 1900 + i;
    return { value: year.toString(), label: year.toString() };
  });
  const currentMonth = format(getMonth(new Date()), "MMMM");
  const currentUpdatedYear = format(getYear(new Date()), "yyyy");
  const [selectedYear, setSelectedYear] = useState<string>(currentUpdatedYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const handleYear = (year: string) => {
    setSelectedYear(year);
    console.log("selected year ", selectedYear);
  };
  const handleMonth = (month: string) => {
    setSelectedMonth(month);
    console.log(" selected month", selectedYear);
  };

  const { data, refetch: refetchVacantAndBookedSlots } =
    api.noOfVacantAndBookedSlots.noOfVacantAndBookedSlots.useQuery({
      year: selectedYear,
      month: selectedMonth,
    });
  useEffect(() => {
    refetchVacantAndBookedSlots()
  }, [
    selectedYear, selectedMonth
  ]);
  console.log("selected year and selected month", selectedYear, selectedMonth , data);

  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 xl:p-5 2xl:p-[26px] shadow-sm hover:shadow-md transition-shadow">
      {/* vacantAndBookedSlots and dropdown */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ">
        {/* vacantAndBookedSlots */}
        <div className="font-inter text-base font-semibold text-active lg:text-xl 2xl:text-2xl">
          Vacant and Booked Slots
        </div>
        {/* dropdowns */}
        <div className="flex flex-wrap gap-4 lg:gap-5 xl:gap-4 2xl:gap-5 ">
          {/* 1-dropdown */}
          <div>
            <Select onValueChange={handleYear}>
              <SelectTrigger className="w-full">
                <SelectValue
                  className="text-[14px]"
                  placeholder="Select Year"
                />
              </SelectTrigger>
              <SelectContent className="bg-white ">
                {years.map((item) => {
                  return (
                    <>
                      <SelectItem value={item.value}>{item.label}</SelectItem>
                    </>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 2-dropdown */}
          <div>
            <Select onValueChange={handleMonth}>
              <SelectTrigger className="w-full">
                <SelectValue
                  className="text-[14px]"
                  placeholder="Select month"
                />
              </SelectTrigger>
              <SelectContent className="bg-white ">
                <SelectGroup>
                  {months.map((month) => {
                    return (
                      <>
                        <SelectItem value={month.value}>
                          {month.label}
                        </SelectItem>
                      </>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* 3rd-dropdown */}
          {/* <div>
          <Select>
            <SelectTrigger className="w-full">
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
      </div>

      {/* bar-chart */}
      <div className="mt-[12px] lg:mt-[30px] xl:mt-6 2xl:mt-[31px]">
        <DashboardBarChart />
      </div>
    </div>
  );
};

export default VacantAndBookedSlots;
