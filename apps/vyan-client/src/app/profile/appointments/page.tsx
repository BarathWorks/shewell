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
import ProfileNav from "~/components/profile-nav";
import Ongoing from "./ongoing";
import Upcoming from "./upcoming";
// import Past from "./past";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Past from "./past";
import Cancelled from "./cancelled";
import React from "react";

enum Duration {
  ONE_WEEK = "1_WEEK",
  ONE_MONTH = "1_MONTH",
  THREE_MONTHS = "3_MONTHS",
  SIX_MONTHS = "6_MONTHS",
  ONE_YEAR = "1_YEAR",
}
const Orders = () => {
  const [duration, setDuration] = useState<Duration>(Duration.ONE_WEEK);
  const handleDurationChange = (value: Duration) => {
    setDuration(value);
  };

  const session = useSession();

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb>
              <BreadcrumbList className="text-sm text-muted">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="inline-block py-1 hover:text-primary-700">
              Home
            </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="inline-block py-1 text-ink">Appointments</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
      </Breadcrumb>

      <div className="surface-card p-5 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
            Appointments
          </h1>
          <div className="w-full sm:w-48">
                    <Select
                      value={duration}
                      onValueChange={handleDurationChange}
                    >
                      <SelectTrigger className="h-11 w-full rounded-lg border-hairline-strong bg-surface text-sm font-medium text-ink">
                        <SelectValue placeholder="Past" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border border-hairline bg-surface p-1 shadow-lg">
                        <SelectItem value={Duration.ONE_WEEK}>
                          1 week
                        </SelectItem>
                        <SelectItem value={Duration.ONE_MONTH}>
                          1 month
                        </SelectItem>
                        <SelectItem value={Duration.THREE_MONTHS}>
                          3 months
                        </SelectItem>
                        <SelectItem value={Duration.SIX_MONTHS}>
                          6 months
                        </SelectItem>
                        <SelectItem value={Duration.ONE_YEAR}>
                          1 year
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Tabs defaultValue="Ongoing">
                    <TabsList className="flex flex-wrap justify-center gap-10 gap-y-5 text-sm font-medium text-muted md:text-base 2xl:text-lg">
                      <TabsTrigger
                        className="border-b-primary font-poppins data-[state=active]:border-b-2"
                        value="Ongoing"
                      >
                        Today
                      </TabsTrigger>
                      <TabsTrigger
                        className="border-b-primary font-poppins data-[state=active]:border-b-2"
                        value="Upcoming"
                      >
                        Upcoming
                      </TabsTrigger>
                      <TabsTrigger
                        className="border-b-primary font-poppins data-[state=active]:border-b-2"
                        value="Past"
                      >
                        Past
                      </TabsTrigger>
                      <TabsTrigger
                        className="border-b-primary font-poppins data-[state=active]:border-b-2"
                        value="Cancelled"
                      >
                        Cancelled
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="Ongoing"
                      className="mt-7 lg:mt-[30px] xl:mt-9 2xl:mt-10"
                    >
                      <Ongoing />
                    </TabsContent>
                    <TabsContent
                      value="Upcoming"
                      className="mt-7 lg:mt-[30px] xl:mt-9 2xl:mt-10"
                    >
                      <Upcoming />
                    </TabsContent>

                    <TabsContent
                      value="Past"
                      className="mt-7 lg:mt-[30px] xl:mt-9 2xl:mt-10"
                    >
                      <Past duration={duration} />
                    </TabsContent>

                    <TabsContent
                      value="Cancelled"
                      className="mt-7 lg:mt-[30px] xl:mt-9 2xl:mt-10"
                    >
                      <Cancelled />
                    </TabsContent>
                  </Tabs>
                </div>
      </div>
    </div>
  );
};
export default Orders;
