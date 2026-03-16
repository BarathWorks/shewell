"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import {
  addDays,
  subDays,
  format,
  startOfToday,
  addMinutes,
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
import { add } from "date-fns";
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
  // isCouple
  // reSelectTimeSlot,
}: {
  professionalUserId: string;
  onSelectDuration: (duration: number) => void;
  // isCouple : boolean
  onSelectDateTime: (dateTime: {
    date: Date;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }) => void;
  // reSelectTimeSlot: () => void;
}) => {
  const today = startOfToday();
  const [startDate, setStartDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  // const [timeSlots, setTimeSlots] = useState<TimeSlot | null>(null)
  const [minDuration, setMinDuration] = useState<number | null>(null);
  const [timeDuration, setTimeDuration] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date;
    // timeSlots: { startTime: Date; endTime: Date }[];
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

    // console.log("selected Date On Click", selectedDate);
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

    // console.log("selected time slot day", selectedDateTime.timeSlots);
  };

  const isPrevDisabled = startDate <= today;

  const days: Date[] = [];
  for (let i = 0; i < 4; i++) {
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
      // couple :isCouple
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
    if (timeDurationData?.minTimeDuration) {
      setMinDuration(timeDurationData.minTimeDuration.time);
      onSelectDuration(timeDurationData.minTimeDuration.time);
    }
  }, [timeDurationData]);

  useEffect(() => {
    const availableTimeSlots =
      timeSlotsData &&
      timeSlotsData.timeSlots.flatMap((slot) =>
        slot.availableTimings.map((timing) => ({
          startTime: new Date(timing.startingTime),
          endTime: new Date(timing.endingTime),
        })),
      );

    if (timeDurationData) {
      setTimeSlots(
        generateTimeSlots(
          availableTimeSlots!,
          timeDurationData.minTimeDuration?.time!,
        ),
      );
      // console.log("timeSlotsForMinDuration", timeSlots)
    }
    if (timeDuration) {
      if (timeDuration) {
        setTimeSlots(generateTimeSlots(availableTimeSlots!, timeDuration));
        onSelectDuration(timeDuration);
        // console.log("timeSlotsForTimeDuration", timeSlots)
      }
    }
  }, [timeSlotsData, timeDuration, timeDurationData, selectedDate]);

  // working generate time slots

  // const generateTimeSlots = (
  //   timeSlots: { startTime: Date; endTime: Date }[],
  //   duration: number,
  // ): TimeSlot[] => {
  //   const generatedTimeSlots: TimeSlot[] = [];

  //   timeSlots?.forEach((slot) => {
  //     let currentTime = new Date(slot.startTime);
  //     const endTime = new Date(slot.endTime);

  //     while (
  //       isBefore(currentTime, endTime) ||
  //       currentTime.getTime() === endTime.getTime()
  //     ) {
  //       const endingTime = addMinutes(currentTime, duration);

  //       // Ensure the generated time slot doesn't exceed the end time
  //       if (
  //         isBefore(endingTime, endTime) ||
  //         endingTime.getTime() === endTime.getTime()
  //       ) {
  //         generatedTimeSlots.push({
  //           availableTimings: [
  //             {
  //               startingTime: currentTime,
  //               endingTime,
  //             },
  //           ],
  //         });
  //       }

  //       currentTime = addMinutes(currentTime, duration);
  //     }
  //   });

  //   return generatedTimeSlots;
  // };

  const generateTimeSlots = (
    timeSlots: { startTime: Date; endTime: Date }[],
    duration: number,
  ): TimeSlot[] => {
    const generatedTimeSlots: TimeSlot[] = [];
    const now = new Date();

    const roundMinutes = (date: Date): Date => {
      const minutes = date.getMinutes();
      const roundedDate = new Date(date);

      // Round minutes to the next 10-minute interval
      if (minutes >= 1 && minutes <= 9) {
        roundedDate.setMinutes(10);
      }
      // Round to 20
      else if (minutes >= 11 && minutes <= 19) {
        roundedDate.setMinutes(20);
      }
      // Round to 30
      else if (minutes >= 21 && minutes <= 29) {
        roundedDate.setMinutes(30);
      }
      // Round to 40
      else if (minutes >= 31 && minutes <= 39) {
        roundedDate.setMinutes(40);
      }
      // Round to 50
      else if (minutes >= 41 && minutes <= 49) {
        roundedDate.setMinutes(50);
      }
      // Round to next hour
      else if (minutes >= 51 && minutes <= 59) {
        roundedDate.setMinutes(0);
        roundedDate.setHours(roundedDate.getHours() + 1);
      }

      return roundedDate;
    };

    timeSlots?.forEach((slot) => {
      let currentTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      const isToday = currentTime.toDateString() === now.toDateString();

      if (isToday && currentTime < add(now, { hours: 2 })) {
        currentTime = roundMinutes(add(now, { hours: 2 }));
      } else {
        currentTime = roundMinutes(currentTime);
      }

      while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
        const slotEndTime = roundMinutes(
          new Date(currentTime.getTime() + duration * 60000),
        );
        generatedTimeSlots.push({
          availableTimings: [
            {
              startingTime: new Date(currentTime),
              endingTime: slotEndTime,
            },
          ],
        });
        currentTime.setMinutes(currentTime.getMinutes() + duration);
        currentTime = roundMinutes(currentTime);
      }
    });

    return generatedTimeSlots;
  };

  // useEffect(() => {setSelectedTimeSlot(selectedTimeSlot)},[selectedTimeSlot])
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#00898F]" />
        <span className="text-lg font-semibold text-[#333333]">
          Available Time Slots
        </span>
      </div>
      <div className="mb-4 mt-2 h-px w-full bg-gray-300"></div>
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
                    ? "bg-[#00898F] text-white shadow-md"
                    : "bg-transparent text-[#666666] hover:bg-white hover:text-[#00898F]"
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

        {/* add time */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#333333]">Duration:</span>
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
            <SelectTrigger className="w-[120px] rounded-xl border-gray-200 bg-white font-medium text-[#333333] shadow-sm">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 bg-white shadow-lg">
              <SelectGroup>
                {timeDurationData?.timeDurations.map((timeDuration) => (
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
        className={`mt-[18px] ${filteredTimeSlots.length > 0 ? "max-h-[78px] overflow-y-auto" : ""}`}
      >
        {filteredTimeSlots.length > 0 ? (
          <div className="flex flex-wrap gap-[18px]">
            {filteredTimeSlots.map((slot, index) => (
              <div key={index} className="flex flex-col gap-2">
                {slot.availableTimings.map((timing, idx) => (
                  <div key={idx} className="flex items-center">
                    <span
                      className={`cursor-pointer rounded-md border border-primary px-2 py-1 font-inter text-sm font-medium text-black hover:bg-primary hover:text-white ${
                        selectedTimeSlot &&
                        selectedTimeSlot.date === selectedDate &&
                        selectedTimeSlot.timeSlots?.startTime ===
                          timing.startingTime
                          ? "bg-primary text-white"
                          : ""
                      }`}
                      onClick={() =>
                        handleTimeSlotClick(
                          {
                            startTime: timing.startingTime,
                            endTime: timing.endingTime,
                          },
                          pricesInCents?.price?.priceInCentsForSingle!,
                        )
                      }
                    >
                      {format(timing.startingTime, "h:mm a")} -{" "}
                      {format(timing.endingTime, "h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex min-h-[100px] w-full items-center justify-center rounded-2xl border border-gray-100 bg-[#FCFCFD]">
            <div className="flex flex-col items-center gap-2 text-[#999999]">
              <Clock className="h-6 w-6 opacity-50" />
              <p className="text-sm font-medium">
                No available slots for this date
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DayNavigatorWithTimeSlots;
