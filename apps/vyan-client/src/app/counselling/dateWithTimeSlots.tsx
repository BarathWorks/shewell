"use client";
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  addDays,
  subDays,
  format,
  startOfToday,
  endOfDay,
} from "date-fns";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { filterAvailableTimeSlots } from "~/lib/utils";

interface TimeSlot {
  availableTimings: {
    startingTime: Date;
    endingTime: Date;
  }[];
}

const DayNavigatorWithTimeSlots = ({
  professionalUserId,
  onSelectDuration,
  onSelectDateTime,
  onPriceChange,
}: {
  professionalUserId: string;
  onSelectDuration: (duration: number) => void;
  onSelectDateTime: (dateTime: {
    date: Date;
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }) => void;
  onPriceChange?: (price: number) => void;
}) => {
  const today = startOfToday();
  const [startDate, setStartDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeDuration, setTimeDuration] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date;
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }>();

  const handlePrevDay = () => {
    setStartDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setStartDate((prevDate) => addDays(prevDate, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotClick = (
    timing: { startTime: Date; endTime: Date },
    priceInCents: number,
  ) => {
    const selectedDateTime = {
      date: selectedDate,
      timeSlots: { startTime: timing.startTime, endTime: timing.endTime },
      priceInCents: priceInCents,
    };
    setSelectedTimeSlot(selectedDateTime);
    onSelectDateTime(selectedDateTime);
  };

  const isPrevDisabled = startDate <= today;

  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    days.push(addDays(startDate, i));
  }

  // getting time slots based on the selecting day
  const { data: timeSlotsData, refetch } =
    api.searchTimeSlots.searchTimeSlots.useQuery(
      {
        date: endOfDay(selectedDate),
        expertId: professionalUserId,
      },
      { enabled: true },
    );

  const filteredTimeSlots = filterAvailableTimeSlots(
    timeSlots,
    timeSlotsData?.bookedSlots.map((slot) => ({
      startingTime: new Date(slot.startingTime),
      endingTime: new Date(slot.endingTime),
    })),
  );

  const { data: timeDurationData } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: professionalUserId,
    });

  const { data: pricesInCents } = api.findPrice.findPrice.useQuery(
    {
      duration: timeDuration! || timeDurationData?.minTimeDuration?.time!,
      expertId: professionalUserId,
    },
    {
      enabled:
        !!professionalUserId &&
        !!(timeDuration || timeDurationData?.minTimeDuration?.time),
    },
  );

  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  useEffect(() => {
    if (pricesInCents?.price?.priceInCentsForSingle) {
      onPriceChange?.(pricesInCents.price.priceInCentsForSingle);
    }
  }, [pricesInCents, onPriceChange]);

  useEffect(() => {
    if (timeDurationData?.minTimeDuration) {
      onSelectDuration(timeDurationData.minTimeDuration.time);
    }
  }, [timeDurationData]);

  useEffect(() => {
    if (!timeSlotsData) return;

    const currentDuration = timeDuration || timeDurationData?.minTimeDuration?.time || 30;

    const availableTimeSlots = timeSlotsData.timeSlots.flatMap((slot) =>
      slot.availableTimings.flatMap((timing) => {
        const start = new Date(timing.startingTime);
        const end = new Date(timing.endingTime);
        const slotsArray: { startingTime: Date; endingTime: Date }[] = [];

        let current = start;
        while (current.getTime() + currentDuration * 60 * 1000 <= end.getTime()) {
          const next = new Date(current.getTime() + currentDuration * 60 * 1000);
          slotsArray.push({
            startingTime: current,
            endingTime: next,
          });
          current = next;
        }
        return slotsArray;
      })
    );

    setTimeSlots([{ availableTimings: availableTimeSlots }]);
  }, [timeSlotsData, timeDuration, timeDurationData]);

  return (
    <div className="space-y-4">
      {/* Header and Duration Selector inline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Availability Header */}
        <div className="flex items-center gap-2 text-[#006879]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="align-middle">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 className="font-poppins text-lg font-semibold text-[#0b1c30]">Available Time Slots</h2>
        </div>

        {/* Duration Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[#40484b] text-sm font-semibold whitespace-nowrap">Duration:</label>
          <div className="relative w-32">
            <Select
              value={
                timeDuration?.toString() ||
                timeDurationData?.minTimeDuration?.time.toString()
              }
              onValueChange={(selectedValue: string) => {
                setTimeDuration(parseInt(selectedValue));
                onSelectDuration(
                  parseInt(selectedValue) ||
                    timeDurationData?.minTimeDuration?.time!,
                );
              }}
            >
              <SelectTrigger className="w-full h-10 rounded-lg border border-[#c0c8cc] bg-white text-sm font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#006879] hover:border-[#006879] shadow-none">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-[#c0c8cc]/30 bg-white shadow-lg">
                <SelectGroup>
                  {timeDurationData?.timeDurations.map((durationVal) => (
                    <SelectItem
                      className="cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50"
                      key={durationVal.time}
                      value={durationVal.time.toString()}
                    >
                      {durationVal.time} Min
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Date Selector Carousel */}
      <div className="flex items-center gap-2 bg-[#F4F4F4] rounded-xl p-1.5 border border-[#c0c8cc]/20">
        <button
          onClick={handlePrevDay}
          disabled={isPrevDisabled}
          className={`p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-[#40484b] ${isPrevDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <div className="flex-1 flex justify-between overflow-x-auto scrollbar-hide gap-1.5">
          {days.map((day) => {
            const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#00898F] text-white shadow-sm font-semibold"
                    : "hover:bg-gray-200 rounded-lg text-[#40484b]"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">{format(day, "EEE")}</span>
                <span className="text-sm font-bold leading-tight mt-[1px]">{format(day, "d")}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-[#40484b]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Time Slots Grid */}
      <div
        className={`mt-4 ${filteredTimeSlots.length > 0 ? "h-[152px] overflow-y-auto scrollbar-hide pr-1" : ""}`}
      >
        {filteredTimeSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTimeSlots.flatMap((slot) =>
              slot.availableTimings.map((timing, idx) => {
                const isSelected = selectedTimeSlot &&
                  selectedTimeSlot.date.toDateString() === selectedDate.toDateString() &&
                  new Date(selectedTimeSlot.timeSlots?.startTime || 0).getTime() ===
                    new Date(timing.startingTime).getTime();
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      handleTimeSlotClick(
                        {
                          startTime: timing.startingTime,
                          endTime: timing.endingTime,
                        },
                        pricesInCents?.price?.priceInCentsForSingle!,
                      )
                    }
                    className={`py-3 px-4 border text-center text-xs font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] ${
                      isSelected
                        ? "border-[#00898F] bg-[#E1EBED]/60 text-[#00898F] font-bold shadow-sm"
                        : "border-[#c0c8cc] hover:border-[#00898F] text-[#40484b] hover:text-[#00898F] bg-white hover:shadow-sm"
                    }`}
                  >
                    {format(timing.startingTime, "h:mm a")} -{" "}
                    {format(timing.endingTime, "h:mm a")}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="mt-2 flex min-h-[120px] w-full items-center justify-center rounded-xl border border-[#c0c8cc]/30 bg-[#eff4ff]/20">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Clock className="h-6 w-6 opacity-60 text-gray-400" />
              <p className="text-xs font-semibold">
                No available slots for this date
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayNavigatorWithTimeSlots;
