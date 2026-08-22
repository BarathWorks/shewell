"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import {
  addDays,
  addMinutes,
  isBefore,
  startOfToday,
  subDays,
  format,
  endOfDay,
} from "date-fns";
import { api } from "~/trpc/react";

interface ITimeSlot {
  availableTimings: {
    startingTime: Date;
    endingTime: Date;
  }[];
}

const TimeSlots = ({ expertId }: { expertId: string }) => {
  const today = startOfToday();
  const [startDate, setStartDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeDuration, setTimeDuration] = useState<number>();
  const [timeSlots, setTimeSlots] = useState<ITimeSlot[]>([]);

  const { data: minTimeDuration } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: expertId,
    });

  // Array in which days are stored - showing 4 days
  const days: Date[] = [];
  for (let i = 0; i < 4; i++) {
    days.push(addDays(startDate, i));
  }

  const handlePrevDay = () => {
    setStartDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setStartDate((prevDate) => addDays(prevDate, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const isPrevDisabled = startDate <= today;

  // Time slots for the selected date
  const { data: timeSlotsData, refetch } =
    api.searchTimeSlots.searchTimeSlots.useQuery({
      date: endOfDay(selectedDate),
      expertId: expertId,
    });

  // Time duration for the appointments
  const { data: timeDurations } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: expertId,
    });

  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  // Setting the time slots in the state
  useEffect(() => {
    if (timeSlotsData?.timeSlots) {
      const availableTimeSlots = timeSlotsData.timeSlots.flatMap((slot) =>
        slot.availableTimings.map((timing) => ({
          startTime: new Date(timing.startingTime),
          endTime: new Date(timing.endingTime),
        })),
      );

      if (minTimeDuration && availableTimeSlots.length > 0) {
        setTimeSlots(
          generateTimeSlots(
            availableTimeSlots,
            minTimeDuration.minTimeDuration?.time!,
          ),
        );
      }
      if (timeDuration && availableTimeSlots.length > 0) {
        setTimeSlots(generateTimeSlots(availableTimeSlots, timeDuration));
      }
    }
  }, [timeSlotsData, timeDuration, minTimeDuration]);

  const generateTimeSlots = (
    timeSlots: { startTime: Date; endTime: Date }[],
    duration: number,
  ): ITimeSlot[] => {
    const generatedTimeSlots: ITimeSlot[] = [];

    timeSlots?.forEach((slot) => {
      let currentTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      while (
        isBefore(currentTime, endTime) ||
        currentTime.getTime() === endTime.getTime()
      ) {
        const endingTime = addMinutes(currentTime, duration);

        if (
          isBefore(endingTime, endTime) ||
          endingTime.getTime() === endTime.getTime()
        ) {
          generatedTimeSlots.push({
            availableTimings: [
              {
                startingTime: currentTime,
                endingTime,
              },
            ],
          });
        }

        currentTime = addMinutes(currentTime, duration);
      }
    });

    return generatedTimeSlots;
  };

  return (
    <div className="flex flex-col">
      {/*
        The panel this sits in already has a header, so the section no longer
        needs its own `text-lg` title plus a rule under it.

        Two fixes beyond the styling:
         - The day chips were `<div onClick>`. Not focusable, not announced, and
           no way to change the date from a keyboard. They are radio-style
           buttons now, carrying `aria-pressed`.
         - The slot pills had `cursor-pointer` and a full hover treatment that
           turned them solid teal, but no handler — they are read-only on this
           screen, which is the practitioner's own availability. Presenting them
           as clickable promised an interaction that did not exist.
      */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1 rounded-lg border border-hairline bg-canvas p-1">
          <button
            type="button"
            onClick={handlePrevDay}
            disabled={isPrevDisabled}
            aria-label="Previous day"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-body transition-colors duration-200 hover:bg-surface hover:text-primary-800 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>

          <div className="scrollbar-hide flex min-w-0 gap-0.5 overflow-x-auto">
            {days.map((day) => {
              const isSelected =
                format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  aria-pressed={isSelected}
                  aria-label={format(day, "EEEE d MMMM")}
                  className={[
                    "flex shrink-0 flex-col items-center justify-center rounded-md px-3 py-1.5 transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "text-muted hover:bg-surface hover:text-ink",
                  ].join(" ")}
                >
                  <span className="text-2xs font-semibold uppercase tracking-wide">
                    {format(day, "EEE")}
                  </span>
                  <span className="tabular text-sm font-semibold">
                    {format(day, "d")}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            aria-label="Next day"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-body transition-colors duration-200 hover:bg-surface hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="slot-duration"
            className="text-xs font-medium text-muted"
          >
            Duration
          </label>
          <Select
            value={
              timeDuration?.toString() ||
              minTimeDuration?.minTimeDuration?.time.toString()
            }
            onValueChange={(selectedValue: string) => {
              setTimeDuration(parseInt(selectedValue));
            }}
          >
            <SelectTrigger
              id="slot-duration"
              className="h-9 w-[6.5rem] rounded-lg border-hairline-strong bg-surface text-sm font-medium text-ink shadow-xs"
            >
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-hairline bg-surface shadow-lg">
              <SelectGroup>
                {timeDurations?.timeDurations.map((duration) => (
                  <SelectItem
                    className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-body hover:bg-slate-50"
                    key={duration.time}
                    value={duration.time.toString()}
                  >
                    {duration.time} min
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        {timeSlots.length > 0 ? (
          <ul className="flex max-h-52 flex-wrap gap-2 overflow-y-auto">
            {timeSlots.map((slot, index) =>
              slot.availableTimings.map((timing, idx) => (
                <li
                  key={`${index}-${idx}`}
                  className="tabular rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-800 ring-1 ring-inset ring-primary-200/70"
                >
                  {format(timing.startingTime, "h:mm a")} &ndash;{" "}
                  {format(timing.endingTime, "h:mm a")}
                </li>
              )),
            )}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-hairline-strong px-4 py-8 text-center">
            <Clock aria-hidden="true" className="size-5 text-muted" />
            <p className="text-sm font-medium text-body">
              No slots open on this date
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              Set your weekly hours from the Appointments screen to open bookings
              on this day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlots;
