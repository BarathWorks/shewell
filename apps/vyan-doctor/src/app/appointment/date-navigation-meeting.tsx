"use client";
import { Button } from "@repo/ui/src/@/components/button";
import React, { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import EditAvailablity from "./add-unavailability";
import Meetings from "./meetings";
import MeetingCard from "./overlay-meeting-card";
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { BookAppointmentStatus } from "@repo/database";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
interface IUnavailableDays {
  date: Date;
}
const DateNavigationMeeting = ({
  unavailableDays,
}: {
  unavailableDays: IUnavailableDays[];
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // use to refetch the data using trpc
  const trpcContext = api.useUtils();

  const handlePrevious = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 1);
      return newDate;
    });
  };

  const { data, refetch } = api.searchMeeting.searchMeeting.useQuery(
    {
      date: currentDate,
    },
    {
      refetchOnWindowFocus: true,
      enabled: !!currentDate,
    },
  );

  // console.log("meetingsDoctor", data);
  console.log("meetingsDoctor", data);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
 
  return (
    <>
      <div className="flex flex-col gap-5 md:gap-[37px] xl:gap-10">
        {/* upper-content */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
          {/* date-navigator */}
          <div className="flex flex-col">
            <div className="mt-4 flex items-center justify-center gap-3">
              {/* Previous Button - More refined */}
              <Button
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#00898F] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#007a80] hover:shadow-xl active:scale-95"
                onClick={handlePrevious}
              >
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                >
                  <path
                    d="M8.5 1L1.5 8L8.5 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              
              {/* Date Display - Enhanced pill */}
              <div className="rounded-full bg-[#00898F] px-8 py-3.5 shadow-lg ring-4 ring-[#00898F]/20">
                <span className="font-poppins text-base font-semibold tracking-wide text-white sm:text-lg md:text-xl">
                  {formatDate(currentDate)}
                </span>
              </div>
              
              {/* Next Button - More refined */}
              <Button
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#00898F] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#007a80] hover:shadow-xl active:scale-95"
                onClick={handleNext}
              >
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  <path
                    d="M1.5 1L8.5 8L1.5 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* edit-unavailability */}
        </div>
        {/* meetings */}
        <div className="flex flex-col gap-6 pb-[65px] 2xl:px-[176px]">
          {data?.typedMeetings.length! > 0
            ? data?.typedMeetings.map((meeting, index) => {
                return (
                  <>
                    <div
                      key={index}
                      className="group rounded-2xl border border-[#00898F]/20 bg-[#F0FDFD] px-4 py-4 shadow-sm transition-all duration-300 hover:border-[#00898F]/40 hover:shadow-md md:px-6 md:py-5"
                    >
                      {/* outer-div */}
                      <div className="flex items-center justify-between">
                        {/* left-div */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-3">
                            {/* Green dot indicator */}
                            <div className="h-2.5 w-2.5 rounded-full bg-[#00898F] shadow-[0_0_8px_rgba(0,137,143,0.4)]"></div>
                            
                            <div className="font-poppins text-lg font-bold text-[#0E3A47] md:text-xl">
                              Meeting with {meeting.patient.firstName || "User"}
                            </div>
                            
                            {BookAppointmentStatus.COMPLETED === meeting.status && (
                              <div className="rounded-full bg-[#00898F]/10 px-2.5 py-0.5 font-poppins text-xs font-medium text-[#00898F]">
                                Completed
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 pl-5.5">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="opacity-60"
                            >
                              <path
                                d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                                stroke="#0E3A47"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 3.5V8L11 9.5"
                                stroke="#0E3A47"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="font-poppins text-sm font-medium text-[#0E3A47]/60">
                              {format(meeting.startingTime, "h:mm a")} - {format(meeting.endingTime, "h:mm a")}
                            </div>
                          </div>
                        </div>
                        
                        {/* right-div - Menu Button */}
                        <div className="rounded-full bg-white p-2 shadow-sm transition-all duration-300 group-hover:bg-[#00898F] group-hover:text-white group-hover:shadow-md">
                          <MeetingCard meetingInfo={meeting as any} />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })
            : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#00898F]/30 bg-gradient-to-br from-[#F8FFFE] to-[#F0F9FF] py-16 px-8">
                <div className="mb-4 rounded-full bg-[#00898F]/10 p-6">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V6" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14L12 18" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 16H14" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-poppins text-lg font-semibold text-[#0E3A47]">No Appointments Today</h3>
                <p className="mt-2 max-w-sm text-center font-poppins text-sm text-[#0E3A47]/60">
                  You don't have any meetings scheduled for this day. Use the navigation to browse other dates.
                </p>
              </div>
            )}
        </div>
      </div>
    </>
  );
};
export default DateNavigationMeeting;
