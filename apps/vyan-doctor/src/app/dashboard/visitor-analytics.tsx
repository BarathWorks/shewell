import React from "react";
import MonthPicker from "./month-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import DashboardBarChart from "./dashboard-bar-chart";
import DashboardPieChart from "./dashboard-pie-chart";
interface ISpecializationParentCategory{
  name : string;
  percentage : string
  visitors : number
}
const VisitorAnalytics = (
   
) => {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 xl:p-5 2xl:p-[26px] shadow-sm hover:shadow-md transition-shadow">
      {/* visitor-analytics and dropdown */}
      <div className="flex gap-[18px] sm:items-center sm:justify-between flex-wrap">
        {/* visitor-analytics */}
        <div className="font-inter text-sm font-medium text-active lg:text-lg 2xl:text-2xl">
          Visitors Analytics
        </div>
        {/* dropdown */}
        {/* <div className="flex  gap-[18px] lg:gap-[22px] xl:gap-6 2xl:gap-8">
          <MonthPicker />

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

      <div className="mt-[12px] lg:mt-[30px] xl:mt-6 2xl:mt-[31px]">
        <DashboardPieChart />
      </div>
    </div>
  );
};

export default VisitorAnalytics;
