"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import Ongoing from "./ongoing";
import Upcoming from "./upcoming";
import Past from "./past";
import Cancelled from "./cancelled";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle, CalendarDays } from "lucide-react";

enum Duration {
  ONE_WEEK = "1_WEEK",
  ONE_MONTH = "1_MONTH",
  THREE_MONTHS = "3_MONTHS",
  SIX_MONTHS = "6_MONTHS",
  ONE_YEAR = "1_YEAR",
}

const AppointmentsPage = () => {
  const [duration, setDuration] = useState<Duration>(Duration.ONE_WEEK);

  const handleDurationChange = (value: Duration) => {
    setDuration(value);
  };

  return (
    <div className="w-full font-inter space-y-6">
      {/* Breadcrumbs */}
      <div className="pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-gray-500 hover:text-[#00898F]">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile/appointments" className="text-[#00898F] font-medium">
                Appointments
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Card Container */}
      <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Card Title Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4EE] text-[#00898F]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-xl font-semibold text-[#181818] md:text-2xl">
                Doctor Appointments
              </h1>
              <p className="font-inter text-xs text-[#666666] mt-0.5">
                View today's sessions, manage upcoming consultations, and view past medical history.
              </p>
            </div>
          </div>

          {/* Time Filter Select */}
          <div className="w-full sm:w-44">
            <Select value={duration} onValueChange={handleDurationChange}>
              <SelectTrigger className="w-full rounded-xl border-gray-200 bg-gray-50 font-inter text-xs focus:border-[#00898F]">
                <SelectValue placeholder="Past Duration" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 bg-white shadow-md">
                <SelectItem value={Duration.ONE_WEEK} className="text-xs font-inter">Last 1 Week</SelectItem>
                <SelectItem value={Duration.ONE_MONTH} className="text-xs font-inter">Last 1 Month</SelectItem>
                <SelectItem value={Duration.THREE_MONTHS} className="text-xs font-inter">Last 3 Months</SelectItem>
                <SelectItem value={Duration.SIX_MONTHS} className="text-xs font-inter">Last 6 Months</SelectItem>
                <SelectItem value={Duration.ONE_YEAR} className="text-xs font-inter">Last 1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div>
          <Tabs defaultValue="Ongoing" className="w-full">
            <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-2 rounded-2xl bg-gray-50 p-1.5 sm:w-fit">
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Ongoing"
              >
                <Clock className="h-4 w-4" />
                Today
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Upcoming"
              >
                <CalendarDays className="h-4 w-4" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Past"
              >
                <CheckCircle className="h-4 w-4" />
                Past
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Cancelled"
              >
                <XCircle className="h-4 w-4" />
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Ongoing" className="mt-0 focus-visible:outline-none">
              <Ongoing />
            </TabsContent>

            <TabsContent value="Upcoming" className="mt-0 focus-visible:outline-none">
              <Upcoming />
            </TabsContent>

            <TabsContent value="Past" className="mt-0 focus-visible:outline-none">
              <Past duration={duration} />
            </TabsContent>

            <TabsContent value="Cancelled" className="mt-0 focus-visible:outline-none">
              <Cancelled />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;

