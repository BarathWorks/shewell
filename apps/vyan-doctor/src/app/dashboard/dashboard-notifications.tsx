"use client ";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";

export const NotificationCard = ({
  title,
  time,
  message,
}: {
  title: string;
  time: string;
  message: string;
}) => {
  return (
    <div className="flex flex-col gap-2 py-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="h-[6px] w-[6px] rounded-full bg-secondary"></div>
          <div className="font-inter text-sm font-medium text-active 2xl:text-[17px] 2xl:leading-[24px]">
            {title}
          </div>
        </div>
        <div className="font-inter text-xs font-medium text-secondary 2xl:text-sm ">
          {time}
        </div>
      </div>
      <div className="font-inter text-sm font-normal text-inactive 2xl:text-[17px] 2xl:leading-[24px]">
        {message}
      </div>
    </div>
  );
};

const cards = [
  {
    title: "Upcoming Appointment",
    time: "11:00 AM",
    message: "Your next meeting is about to start , please login into",
  },
  {
    title: "Transaction of INR 30,000 into y..",
    time: "9:45 AM",
    message: "Dear Doc, as your booked appointment we have trans",
  },
  {
    title: "Appointment Confirmation",
    time: "9:45 AM",
    message: "Dear Doc, the patient has confirmed the appointment",
  },
];
const DashboardNotification = ({
  notifications,
}: {
  notifications?: {
    id: string;
    title: string;
    description: string;
    time: Date;
  }[];
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 xl:p-5 2xl:p-[26px] shadow-sm hover:shadow-md transition-shadow">
      {/* notification and dropdown */}
      <div className="mb-3 flex items-center justify-between 2xl:mb-[14px]">
        <div className="font-inter text-base font-semibold text-active lg:text-xl 2xl:text-2xl">
          Notification
        </div>

        <Select>
          <SelectTrigger className="w-[107px]">
            <SelectValue className="text-[14px]" placeholder="Theme" />
          </SelectTrigger>
          <SelectContent className="bg-white ">
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* notification-card */}
      <div className="flex flex-col divide-y-2 divide-[#8F8F8F]">
        {notifications && notifications.length > 0 ? (
          notifications.map((item) => (
            <NotificationCard
              key={item.id}
              title={item.title}
              message={item.description}
              time={new Date(item.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          ))
        ) : (
          <div className="py-4 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </div>

      {/* transaction */}
     
    </div>
  );
};

export default DashboardNotification;
