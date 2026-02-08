"use client";
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
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
    <>
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#00898F]" />
        <span className="font-poppins text-lg font-semibold text-[#333333]">
          Available Time Slots
        </span>
      </div>
      <div className="mb-6 mt-4 h-px w-full bg-gray-100"></div>
      <div className="flex flex-wrap justify-between gap-y-5">
        <div className="flex items-center gap-2 rounded-2xl bg-[#F8F8F8] p-1.5">
          <button
            onClick={handlePrevDay}
            disabled={isPrevDisabled}
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all hover:bg-gray-50 ${isPrevDisabled ? "cursor-not-allowed opacity-50" : "hover:text-[#00898F]"}`}
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 11L1.5 6L6.5 1"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto px-1">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl px-4 py-2 transition-all duration-300 ${
                  format(day, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd")
                    ? "border-0 bg-[#00898F] text-white shadow-md"
                    : "border-0 bg-transparent text-[#666666] hover:bg-white hover:text-[#00898F]"
                }`}
              >
                <span className="text-xs font-medium uppercase opacity-80">
                  {format(day, "EEE")}
                </span>
                <span className="text-sm font-semibold">
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleNextDay}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all hover:bg-gray-50 hover:text-[#00898F]"
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1L6.5 6L1.5 11"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#333333]">Duration:</span>
          <Select
            value={
              timeDuration?.toString() ||
              minTimeDuration?.minTimeDuration?.time.toString()
            }
            onValueChange={(selectedValue: string) => {
              setTimeDuration(parseInt(selectedValue));
            }}
          >
            <SelectTrigger className="w-[120px] rounded-xl border-gray-200 bg-white font-medium text-[#333333] shadow-sm">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 bg-white shadow-lg">
              <SelectGroup>
                {timeDurations?.timeDurations.map((timeDuration) => (
                  <SelectItem
                    className="cursor-pointer rounded-lg bg-white px-2 py-1.5 text-sm font-medium text-[#333333] hover:bg-gray-50"
                    key={timeDuration.time}
                    value={timeDuration.time.toString()}
                  >
                    {timeDuration.time} Min
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div
        className={`mt-[18px] ${timeSlots.length > 0 ? "max-h-[85px] overflow-y-auto" : ""}`}
      >
        {timeSlots.length > 0 ? (
        <div className="flex flex-wrap gap-3">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex flex-col gap-2">
                {slot.availableTimings.map((timing, idx) => (
                  <div key={idx} className="flex items-center">
                    <span
                      className="cursor-pointer rounded-xl border-2 border-[#00898F]/20 bg-[#F8FFFE] px-3 py-2 font-poppins text-sm font-medium text-[#0E3A47] shadow-sm transition-all duration-300 hover:border-[#00898F] hover:bg-[#00898F] hover:text-white hover:shadow-md"
                    >
                      {format(timing.startingTime, "h:mm a")} - {format(timing.endingTime, "h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex min-h-[100px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#00898F]/20 bg-gradient-to-br from-[#F8FFFE] to-white">
            <div className="flex flex-col items-center gap-2 px-4 py-4">
              <div className="rounded-full bg-[#00898F]/10 p-3">
                <Clock className="h-5 w-5 text-[#00898F]" />
              </div>
              <p className="text-center font-poppins text-sm font-medium text-[#0E3A47]/60">
                No available slots for this date
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TimeSlots;
