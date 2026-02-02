"use client";
// import { useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";

// const events = [{ title: "Meeting", start: new Date() }];

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import EditAvailablity from "./add-unavailability";

import AppointmentSettings from "./appointment-settings";
import DateNavigator from "./date-navigator";
import Meetings from "./meetings";
import DateNavigationMeeting from "./date-navigation-meeting";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { Day } from "@repo/database";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import { Button } from "@repo/ui/src/@/components/button";
import DeleteAvailabilityUserAction from "./delete-availability-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface IAvailaibleTimings {
  startingTime: Date;
  endingTime: Date;
}
interface IUnavailableDays {
  date: Date;
}
interface IAvailabilities {
  available: boolean;
  day: Day;
  availableTimings: IAvailaibleTimings[];
}
const FullCalendarPage = ({
  availabilities,
  unavailableDays
}: {
  availabilities: IAvailabilities[];
  unavailableDays : IUnavailableDays[]
}) => {
  

  type Meeting = {
    id: string;
    serviceType: string; // Assuming AppointmentType is a string
    priceInCents: number;
    description: string;
    planName: string;
    professionalUserId: string;
    patientId: string;
    startingTime: Date;
    endingTime: Date;
    createdAt: Date;
    updatedAt: Date;
    status?: string | null; // Assuming BookAppointmentStatus is a string or optional
    userId: string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
  };

  type Events = {
    [date: string]: {
      title?: string;
      start: string; // Start date in string format
      count: number;
    };
  };
  function renderEventContent(eventInfo: any) {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    );
  }

  const [openDeleteUnvailableDialog, setOpenDeleteUnavailableDialog] =
    useState<boolean>(false);

  const [dayToBeDeleted, setDayToBeDeleted] = useState<Date>();
  console.log("dayToBeDeleted", dayToBeDeleted);
  

  // // function to calculate the last and first day of month
  const findFirstAndLastDayOfMonth = (date: Date) => {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { firstDay, lastDay };
  };

  // // using function, to calculate the first day and last Day
  const { firstDay, lastDay } = findFirstAndLastDayOfMonth(new Date());

  // // fetching  meetings and unavailable days for complete month
  const { data, refetch } =
    api.searchMeetingForADayRange.searchMeetingForADayRange.useQuery({
      startDate: firstDay,
      endDate: lastDay,
    });

  // console.log(
  //   "meetingsRange",
  //   data?.meetingsForADayRange,
  //   data?.unAvailableDays,
  // );

  // // Process the data to create events
  const events = data
    ? (data.meetingsForADayRange as any[]).reduce((acc: Events, meeting: Meeting) => {
        const meetingDate = meeting.startingTime.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
        if (!acc[meetingDate!]) {
          acc[meetingDate!] = {
            title: "1 Meeting aligned",
            start: meetingDate!,
            count: 1,
          };
        } else {
          acc[meetingDate!]!.count += 1;
          acc[meetingDate!]!.title =
            `${acc[meetingDate!]!.count} Meetings aligned `;
        }

        return acc;
      }, {} as Events)
    : {};

  // Process unavailable days and override meetings if necessary
  if (data?.unAvailableDays) {
    data.unAvailableDays.forEach((unavailableDay ) => {
      const unavailableDate = new Date(unavailableDay.date)
        .toISOString()
        .split("T")[0];
      events[unavailableDate!] = {
        title: "Unavailable",
        start: unavailableDate!,
        count: 0,
      };
    });
  }
  // // Convert the events object to an array
  const eventsArray = Object.values(events);

  const getDate = data?.professionalUser?.createdAt;
  // console.log("getdate", format(getDate!, "MM/dd/yyyy"));

  const { toast } = useToast();
  const trpcContext = api.useUtils();
  const handleDeleteUnavailableDay = () => {
   if(dayToBeDeleted){
    DeleteAvailabilityUserAction(dayToBeDeleted)
    .then((resp) => {
      console.log(resp?.message);
      toast({
        description: resp?.message,
        variant: "default",
      });
      trpcContext.invalidate();
      setOpenDeleteUnavailableDialog(false);
    })
    .catch((err) => {
      console.log(err);
      toast({
        description: err.message,
        variant: "destructive",
      });
    });
   }
  };
  return (
    <>
      <div className="pb-10 pt-8 md:py-[45px] xl:py-[50px] 2xl:py-[65px]">
        {/* heading */}
        <div className="flex flex-row justify-between items-center flex-wrap gap-y-5 rounded-2xl bg-[#00898F] p-4 md:p-6 shadow-lg">
          {/* div-date */}
          <div className="flex w-fit items-center gap-2 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2 border border-white/20">
            <div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3.75 3.75C3.33579 3.75 3 4.08579 3 4.5V15C3 15.4142 3.33579 15.75 3.75 15.75H14.25C14.6642 15.75 15 15.4142 15 15V4.5C15 4.08579 14.6642 3.75 14.25 3.75H3.75ZM1.5 4.5C1.5 3.25736 2.50736 2.25 3.75 2.25H14.25C15.4926 2.25 16.5 3.25736 16.5 4.5V15C16.5 16.2426 15.4926 17.25 14.25 17.25H3.75C2.50736 17.25 1.5 16.2426 1.5 15V4.5Z"
                  fill="#A5F3FC"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 0.75C12.4142 0.75 12.75 1.08579 12.75 1.5V4.5C12.75 4.91421 12.4142 5.25 12 5.25C11.5858 5.25 11.25 4.91421 11.25 4.5V1.5C11.25 1.08579 11.5858 0.75 12 0.75Z"
                  fill="#A5F3FC"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6 0.75C6.41421 0.75 6.75 1.08579 6.75 1.5V4.5C6.75 4.91421 6.41421 5.25 6 5.25C5.58579 5.25 5.25 4.91421 5.25 4.5V1.5C5.25 1.08579 5.58579 0.75 6 0.75Z"
                  fill="#A5F3FC"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.5 7.5C1.5 7.08579 1.83579 6.75 2.25 6.75H15.75C16.1642 6.75 16.5 7.08579 16.5 7.5C16.5 7.91422 16.1642 8.25 15.75 8.25H2.25C1.83579 8.25 1.5 7.91422 1.5 7.5Z"
                  fill="#A5F3FC"
                />
              </svg>
            </div>{" "}
            <div className="font-poppins text-xs font-medium text-white/90 xl:rounded-md xl:text-sm 2xl:text-[18px] 2xl:leading-[29px]">
              {" "}
              {getDate && format(getDate!, "LLL dd',' y")} - Present
            </div>
          </div>
          <div className="font-poppins text-[18px] sm:text-[22px] font-bold leading-8 text-white md:text-[30px] md:leading-[48px] xl:text-[36px] 2xl:text-[40px] 2xl:leading-[52px]">
              Appointment Calendar
            </div>
            <div className="cursor-pointer flex gap-3 flex-wrap">
              <AppointmentSettings availabilities={availabilities} />
                {/* edit-unavailability */}
          <EditAvailablity unavailableDays={unavailableDays} />
            </div>
         
        </div>
      </div>

      {/* calendar */}
      <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={(info) => {
            if (info.dayEl.innerText.includes("Unavailable")) {
              setOpenDeleteUnavailableDialog(true);
              setDayToBeDeleted(info.date);
            }
          }}
          weekends={true}
          events={eventsArray}
          eventContent={renderEventContent}
          eventDidMount={(info) => {
            if (info.event.title.includes("Meetings")) {
              info.el.style.backgroundColor = "#0084FE";
            } else if (info.event.title.includes("Unavailable")) {
              info.el.style.backgroundColor = "#008F4E";
              info.el.style.zIndex = "-1";
            }
            info.el.style.color = "#0084FE";
          }}
        />
      </div>

      {/* Delete-Unavailable-Day-Dialog */}
      <Dialog
        open={openDeleteUnvailableDialog}
        onOpenChange={setOpenDeleteUnavailableDialog}
      >
        <DialogContent className="rounded-2xl border-0 bg-white pt-[50px] shadow-xl">
          <DialogHeader>
            <DialogTitle className="mb-5 font-poppins text-lg font-bold text-[#0E3A47]">
              Do you want to delete the unavailable day?
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <Button 
                onClick={handleDeleteUnavailableDay}
                className="rounded-xl bg-[#00898F] px-6 py-2.5 font-poppins text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg"
              >
                Yes
              </Button>
              <Button 
                onClick={() => setOpenDeleteUnavailableDialog(false)}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-poppins text-sm font-semibold text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
              >
                No
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default FullCalendarPage;
