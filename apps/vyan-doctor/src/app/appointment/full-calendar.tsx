"use client";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import { Day } from "@repo/database";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/src/@/components/dialog";
import { Button } from "@repo/ui/src/@/components/button";
import DeleteAvailabilityUserAction from "./delete-availability-user-action";
import AppointmentSettings from "./appointment-settings";
import EditAvailablity from "./add-unavailability";
import MeetingCard from "./overlay-meeting-card";

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

interface IFullCalendarPageProps {
  availabilities: IAvailabilities[];
  unavailableDays: IUnavailableDays[];
  prices?: {
    priceInCentsForSingle: number | null;
    priceInCentsForCouple: number | null;
  } | null;
}

const FullCalendarPage = ({
  availabilities,
  unavailableDays,
  prices,
}: IFullCalendarPageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isTimingsOpen, setIsTimingsOpen] = useState(false);
  const [isBlackoutOpen, setIsBlackoutOpen] = useState(false);
  const [openDeleteUnvailableDialog, setOpenDeleteUnavailableDialog] = useState<boolean>(false);
  const [dayToBeDeleted, setDayToBeDeleted] = useState<Date>();

  const findFirstAndLastDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { firstDay, lastDay };
  };

  const { firstDay, lastDay } = findFirstAndLastDayOfMonth(currentMonth);

  // Fetch meetings and unavailable days for complete month
  const { data } = api.searchMeetingForADayRange.searchMeetingForADayRange.useQuery({
    startDate: firstDay,
    endDate: lastDay,
  });

  // Process the data to create calendar event markers
  const events: Record<string, { title: string; start: string; count: number }> = {};
  if (data?.meetingsForADayRange) {
    (data.meetingsForADayRange as any[]).forEach((meeting: any) => {
      const meetingDate = new Date(meeting.startingTime).toISOString().split("T")[0];
      if (meetingDate) {
        if (!events[meetingDate]) {
          events[meetingDate] = {
            title: "1 Session",
            start: meetingDate,
            count: 1,
          };
        } else {
          events[meetingDate].count += 1;
          events[meetingDate].title = `${events[meetingDate].count} Sessions`;
        }
      }
    });
  }

  if (data?.unAvailableDays) {
    data.unAvailableDays.forEach((unavailableDay) => {
      const unavailableDate = new Date(unavailableDay.date).toISOString().split("T")[0];
      if (unavailableDate) {
        events[unavailableDate] = {
          title: "Blackout Day",
          start: unavailableDate,
          count: 0,
        };
      }
    });
  }

  const eventsArray = Object.values(events);

  const { toast } = useToast();
  const trpcContext = api.useUtils();

  const handleDeleteUnavailableDay = () => {
    if (dayToBeDeleted) {
      DeleteAvailabilityUserAction(dayToBeDeleted)
        .then((resp) => {
          toast({
            description: resp?.message,
            variant: "default",
          });
          trpcContext.invalidate();
          setOpenDeleteUnavailableDialog(false);
        })
        .catch((err) => {
          toast({
            description: err.message,
            variant: "destructive",
          });
        });
    }
  };

  // Filter meetings for the selected date to show in the Agenda list
  const selectedMeetings =
    data?.meetingsForADayRange?.filter((meeting: any) => {
      const meetingDate = new Date(meeting.startingTime);
      return (
        meetingDate.getDate() === selectedDate.getDate() &&
        meetingDate.getMonth() === selectedDate.getMonth() &&
        meetingDate.getFullYear() === selectedDate.getFullYear()
      );
    }) || [];

  // Setup pricing tags
  const singlePrice = prices?.priceInCentsForSingle
    ? `₹${(prices.priceInCentsForSingle / 100).toLocaleString()}`
    : "₹1,500";
  const couplePrice = prices?.priceInCentsForCouple
    ? `₹${(prices.priceInCentsForCouple / 100).toLocaleString()}`
    : "₹2,500";

  return (
    <div className="space-y-lg">
      {/* Calendar Header Row */}
      <header className="flex items-center justify-between">
        <div className="space-y-base flex items-center justify-between w-full">
          <div className="space-y-1">
            <h1 className="font-display-lg text-display-lg text-primary">Appointment</h1>
            <p className="text-body-md text-on-surface-variant">
              Manage clinical hours, view scheduled sessions, and plan blackout periods.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setIsTimingsOpen(true)}
              className="flex items-center gap-xs px-sm py-xs bg-white border border-outline-variant/30 rounded-xl shadow-sm hover:bg-surface-container-low transition-all font-bold text-body-sm text-on-surface"
            >
              <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
              <span>Timings</span>
            </button>
            <button
              onClick={() => setIsBlackoutOpen(true)}
              className="flex items-center gap-xs px-sm py-xs bg-white border border-outline-variant/30 rounded-xl shadow-sm hover:bg-surface-container-low transition-all font-bold text-body-sm text-on-surface"
            >
              <span className="material-symbols-outlined text-error text-[20px]">event_busy</span>
              <span>Blackout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 12-Column Layout Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Left Column: Monthly Calendar (col-span-8) */}
        <section className="col-span-12 lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg border border-outline-variant/10">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              dateClick={(info) => {
                setSelectedDate(info.date);
                if (info.dayEl.innerText.includes("Blackout")) {
                  setOpenDeleteUnavailableDialog(true);
                  setDayToBeDeleted(info.date);
                }
              }}
              weekends={true}
              events={eventsArray}
              dayCellClassNames={(arg) => {
                const isSelected =
                  arg.date.getDate() === selectedDate.getDate() &&
                  arg.date.getMonth() === selectedDate.getMonth() &&
                  arg.date.getFullYear() === selectedDate.getFullYear();
                return isSelected ? "!bg-primary/10 border-2 border-primary rounded-lg shadow-inner" : "";
              }}
              eventContent={(eventInfo) => {
                const isBlackout = eventInfo.event.title.includes("Blackout");
                return (
                  <div
                    className={`flex items-center gap-xs px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm w-full ${
                      isBlackout
                        ? "bg-red-50 text-red-700 border border-red-200/50"
                        : "bg-teal-50 text-teal-700 border border-teal-200/50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isBlackout ? "event_busy" : "event_available"}
                    </span>
                    <span className="truncate">{eventInfo.event.title}</span>
                  </div>
                );
              }}
              eventDidMount={(info) => {
                info.el.style.backgroundColor = "transparent";
                info.el.style.borderColor = "transparent";
                info.el.style.boxShadow = "none";
                if (info.event.title.includes("Blackout")) {
                  info.el.style.zIndex = "-1";
                }
              }}
              datesSet={(dateInfo) => {
                const visibleDate = dateInfo.view.currentStart;
                if (
                  visibleDate.getMonth() !== currentMonth.getMonth() ||
                  visibleDate.getFullYear() !== currentMonth.getFullYear()
                ) {
                  setCurrentMonth(visibleDate);
                }
              }}
            />
          </div>
        </section>

        {/* Right Column: Pricing & Agenda Timeline (col-span-4) */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-lg">
          {/* Session Pricing */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg border border-outline-variant/10">
            <h3 className="font-headline-sm text-headline-sm mb-md text-on-surface">Session Pricing</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/30">
                <span className="font-body-md text-on-surface-variant">Single Session</span>
                <div className="flex items-center gap-xs">
                  <span className="tabular-nums font-bold text-headline-sm text-on-surface">
                    {singlePrice}
                  </span>
                  <span className="text-label-caps text-outline">/hr</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-sm">
                <span className="font-body-md text-on-surface-variant">Couple Session</span>
                <div className="flex items-center gap-xs">
                  <span className="tabular-nums font-bold text-headline-sm text-on-surface">
                    {couplePrice}
                  </span>
                  <span className="text-label-caps text-outline">/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Selected Date Agenda */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow flex flex-col h-[520px] overflow-hidden border border-outline-variant/10">
            <div className="p-lg border-b border-outline-variant/30 bg-surface-container-low/30">
              <div className="flex items-center gap-sm mb-xs">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">event</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Selected Date Agenda ({selectedMeetings.length} {selectedMeetings.length === 1 ? "Session" : "Sessions"})
                </h3>
              </div>
              <p className="font-body-md font-bold text-primary">
                {format(selectedDate, "eeee, MMM dd, yyyy")}
              </p>
            </div>
            <div className="flex-1 p-lg overflow-y-auto no-scrollbar">
              {selectedMeetings.length > 0 ? (
                <div className="flex flex-col gap-sm">
                  {selectedMeetings.map((meeting: any) => {
                    const patientName = meeting.patient?.firstName || "Patient";
                    const initial = patientName[0] || "P";
                    const start = new Date(meeting.startingTime);
                    const isCouple = meeting.planName?.toLowerCase().includes("couple");

                    return (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between p-md bg-white rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-body-md">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-xs">
                              <span className="font-data-mono text-xs text-outline">
                                {format(start, "hh:mm aa")}
                              </span>
                              <span className="text-outline/20">•</span>
                              <p className="font-body-md font-bold text-on-surface">
                                {patientName}
                              </p>
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full w-fit ${
                                isCouple
                                  ? "bg-secondary/10 text-secondary"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {isCouple ? "groups" : "videocam"}
                              </span>
                              <span className="text-[10px] font-bold tracking-wide uppercase">
                                {isCouple ? "Couple Session" : "Telehealth"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-xs">
                          {meeting.meeting?.hangoutLink && (
                            <a
                              href={meeting.meeting.hangoutLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Join Video Session"
                              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all duration-200"
                            >
                              <span className="material-symbols-outlined text-[20px]">videocam</span>
                            </a>
                          )}
                          <MeetingCard meetingInfo={meeting as any} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-outline text-body-sm py-12">
                  <span className="material-symbols-outlined text-[48px] text-outline/30 mb-2">
                    calendar_today
                  </span>
                  No sessions scheduled for this day
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Dialog Containers (Controlled) */}
      <AppointmentSettings
        availabilities={availabilities}
        open={isTimingsOpen}
        onOpenChange={setIsTimingsOpen}
      />
      <EditAvailablity
        unavailableDays={unavailableDays}
        open={isBlackoutOpen}
        onOpenChange={setIsBlackoutOpen}
      />

      {/* Delete-Unavailable-Day-Dialog */}
      <Dialog open={openDeleteUnvailableDialog} onOpenChange={setOpenDeleteUnavailableDialog}>
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
    </div>
  );
};

export default FullCalendarPage;
