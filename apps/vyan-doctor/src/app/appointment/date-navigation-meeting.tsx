"use client";

import React, { useMemo, useState } from "react";
import { format, isSameDay, isToday } from "date-fns";
import {
  CalendarOff,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  MapPin,
} from "lucide-react";
import { BookAppointmentStatus } from "@repo/database";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { EmptyState, StatusPill } from "~/components/ui/page";
import MeetingCard from "./overlay-meeting-card";

interface IUnavailableDays {
  date: Date;
}

/**
 * One day's schedule, with a day navigator above it.
 *
 * The navigator was three pill-shaped controls centred on the page — two 44px
 * teal circles either side of a teal capsule holding a full long-form date at
 * `text-xl`, all three with `shadow-lg` and one with a 4px ring. It read as the
 * loudest thing on a page whose actual subject is the list below it. It is a
 * single segmented control now, left-aligned with everything else, with a Today
 * button that the previous version had no equivalent of — once you had paged away
 * there was no way back to the current date except counting clicks.
 *
 * The appointment rows were `bg-[#F0FDFD]` cards with a glowing dot, a hand-drawn
 * clock SVG and a `pl-5.5` class that Tailwind does not define (so the indent it
 * was meant to create never applied). They are ordinary list rows now, showing
 * the two things the old card omitted and a practitioner needs at a glance:
 * whether the consultation is online or in person, and what state it is in.
 */

const STATUS_TONE: Partial<
  Record<
    BookAppointmentStatus,
    { tone: "success" | "warning" | "danger" | "brand" | "neutral"; label: string }
  >
> = {
  [BookAppointmentStatus.COMPLETED]: { tone: "success", label: "Completed" },
  [BookAppointmentStatus.PAYMENT_SUCCESSFUL]: { tone: "brand", label: "Confirmed" },
  [BookAppointmentStatus.PAYMENT_PENDING]: { tone: "warning", label: "Awaiting payment" },
  [BookAppointmentStatus.CANCELLED]: { tone: "danger", label: "Cancelled" },
  [BookAppointmentStatus.CANCELLED_WITH_REFUND]: { tone: "danger", label: "Refunded" },
  // Spelling is the schema's, not a typo here: the enum member really is
  // `PAYMMENT_FAILED`. Renaming it is a migration, so this matches what exists.
  [BookAppointmentStatus.PAYMMENT_FAILED]: { tone: "danger", label: "Payment failed" },
};

const DateNavigationMeeting = ({
  unavailableDays,
}: {
  unavailableDays: IUnavailableDays[];
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const shiftDay = (offset: number) =>
    setCurrentDate((previous) => {
      const next = new Date(previous);
      next.setDate(previous.getDate() + offset);
      return next;
    });

  const { data, isLoading } = api.searchMeeting.searchMeeting.useQuery(
    { date: currentDate },
    { refetchOnWindowFocus: true, enabled: Boolean(currentDate) },
  );

  const meetings = data?.typedMeetings ?? [];

  // Whether the practitioner has blocked the day being viewed. The old component
  // received `unavailableDays` and never read it, so a blocked day looked exactly
  // like a day that simply had no bookings.
  const isBlocked = useMemo(
    () => unavailableDays.some((day) => isSameDay(new Date(day.date), currentDate)),
    [unavailableDays, currentDate],
  );

  const viewingToday = isToday(currentDate);

  return (
    <section className="surface-card flex flex-col">
      {/* ---------------------------------------------------------------- */}
      {/* Day navigator                                                     */}
      {/* ---------------------------------------------------------------- */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-ink">
            {format(currentDate, "EEEE d MMMM yyyy")}
            {viewingToday ? <StatusPill tone="brand">Today</StatusPill> : null}
            {isBlocked ? (
              <StatusPill tone="warning" icon={CalendarOff}>
                Blocked
              </StatusPill>
            ) : null}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {isLoading
              ? "Loading this day's schedule…"
              : meetings.length === 1
                ? "1 consultation scheduled"
                : `${meetings.length} consultations scheduled`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!viewingToday ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          ) : null}

          {/* One segmented control rather than two free-floating circles. */}
          <div className="flex items-center rounded-lg border border-hairline-strong bg-surface shadow-xs">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              aria-label="Previous day"
              className="flex size-9 items-center justify-center rounded-l-lg text-body transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            >
              <ChevronLeft className="size-[18px]" />
            </button>

            <span aria-hidden="true" className="h-5 w-px bg-hairline" />

            <button
              type="button"
              onClick={() => shiftDay(1)}
              aria-label="Next day"
              className="flex size-9 items-center justify-center rounded-r-lg text-body transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            >
              <ChevronRight className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Schedule                                                          */}
      {/* ---------------------------------------------------------------- */}
      {isLoading ? (
        <div className="flex flex-col gap-2 p-5">
          {[0, 1, 2].map((row) => (
            <div key={row} className="skeleton h-[4.5rem] w-full" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={isBlocked ? CalendarOff : CalendarRange}
          title={
            isBlocked
              ? "You blocked this day"
              : "No consultations on this day"
          }
          description={
            isBlocked
              ? "Clients cannot book while the day is blocked. Select it on the calendar above to open it up again."
              : "Nothing is booked for this date. Use the arrows above to look at another day."
          }
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {meetings.map((meeting) => {
            const status = meeting.status
              ? STATUS_TONE[meeting.status as BookAppointmentStatus]
              : undefined;
            const isOnline = meeting.serviceType === "ONLINE";

            return (
              <li
                key={meeting.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 transition-colors duration-200 hover:bg-slate-50 sm:px-5"
              >
                {/* Time block — fixed width so every row's text starts on the
                    same vertical line down the list. */}
                <div className="flex w-[6.5rem] shrink-0 flex-col">
                  <span className="tabular text-sm font-semibold text-ink">
                    {format(meeting.startingTime, "h:mm a")}
                  </span>
                  <span className="tabular text-xs text-muted">
                    to {format(meeting.endingTime, "h:mm a")}
                  </span>
                </div>

                <span aria-hidden="true" className="hidden h-9 w-px bg-hairline sm:block" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {meeting.patient.firstName || "Client"}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      {isOnline ? (
                        <Video aria-hidden="true" className="size-3.5" />
                      ) : (
                        <MapPin aria-hidden="true" className="size-3.5" />
                      )}
                      {isOnline ? "Online" : "In person"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Clock aria-hidden="true" className="size-3.5" />
                      {Math.round(
                        (new Date(meeting.endingTime).getTime() -
                          new Date(meeting.startingTime).getTime()) /
                          60000,
                      )}{" "}
                      min
                    </span>

                    {status ? (
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    ) : null}
                  </div>
                </div>

                <div className="ml-auto shrink-0">
                  <MeetingCard meetingInfo={meeting as any} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default DateNavigationMeeting;
