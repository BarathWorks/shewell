"use client";
// import { useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// const events = [{ title: "Meeting", start: new Date() }];

import "react-day-picker/dist/style.css";

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
import { Button } from "~/components/ui/button";
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
  // Annotated explicitly: the ternary's `{}` branch otherwise widens the union so
  // `Object.values` yields `unknown[]`, which FullCalendar's `events` prop rejects.
  const events: Events = data
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
      {/*
        The calendar used to sit under a teal banner carrying the words
        "Appointment Calendar" at `text-[40px]`, a joined-date chip, and the two
        availability controls. The page header now names the screen, and the
        controls are page actions, so what is left is the grid itself on the same
        card every other panel in the app uses — plus a legend, which the coloured
        blocks previously had none of.
      */}
      <section className="surface-card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">Month at a glance</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {getDate
                ? `Practising on Shewell since ${format(getDate, "LLLL yyyy")}.`
                : "Booked days and blocked days across the current month."}{" "}
              Select a blocked day to make yourself available again.
            </p>
          </div>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <li className="flex items-center gap-1.5 text-xs font-medium text-body">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-sm bg-info-500"
              />
              Booked
            </li>
            <li className="flex items-center gap-1.5 text-xs font-medium text-body">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-sm bg-secondary-500"
              />
              Blocked
            </li>
          </ul>
        </header>

        {/* Horizontal scroll is confined to the grid: a month view has a minimum
            usable width and the page body must never be what scrolls sideways. */}
        <div className="overflow-x-auto">
          <div className="min-w-[38rem] p-3 sm:p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
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
        </div>
      </section>

      {/* Delete-Unavailable-Day-Dialog */}
      <Dialog
        open={openDeleteUnvailableDialog}
        onOpenChange={setOpenDeleteUnavailableDialog}
      >
        <DialogContent className="max-w-md rounded-xl border border-hairline bg-surface p-6 shadow-xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-semibold text-ink">
              Make this day available again?
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm leading-relaxed text-body">
              {dayToBeDeleted
                ? `${format(dayToBeDeleted, "EEEE d MMMM yyyy")} is currently blocked. Unblocking it lets clients book any slot your weekly availability already covers.`
                : "Unblocking this day lets clients book any slot your weekly availability already covers."}
            </DialogDescription>
          </DialogHeader>

          {/*
            The two actions were "Yes" and "No" — words that say nothing about
            what happens. They name the outcome now, and the confirming action is
            the primary one rather than both being equally weighted.
          */}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteUnavailableDialog(false)}
            >
              Keep it blocked
            </Button>
            <Button onClick={handleDeleteUnavailableDay}>
              Unblock this day
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default FullCalendarPage;
