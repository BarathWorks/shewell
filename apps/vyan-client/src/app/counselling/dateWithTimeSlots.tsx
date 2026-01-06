"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  addDays,
  subDays,
  format,
  startOfToday,
  isAfter,
  isBefore,
  getHours,
  getMinutes,
  addMinutes,
  isToday,
  endOfDay,
} from "date-fns";
import { api } from "~/trpc/react";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
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
    timeSlotsData?.bookedSlots!,
  );

  

  
  const { data: minTimeDurationData } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: professionalUserId,
    });

  const { data: timeDurations } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: professionalUserId,
    });
  // console.log("timeDurations", timeDurations);
  const { data: pricesInCents } = api.findPrice.findPrice.useQuery({
    duration: timeDuration! || minTimeDurationData?.minTimeDuration?.time!,
    expertId: professionalUserId,
    // couple :isCouple
  });

  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  useEffect(() => {
    if (minTimeDurationData?.minTimeDuration) {
      setMinDuration(minTimeDurationData.minTimeDuration.time);
      onSelectDuration(minTimeDurationData.minTimeDuration.time);
    }
  }, [minTimeDurationData]);

  useEffect(() => {
    const availableTimeSlots =
      timeSlotsData &&
      timeSlotsData.timeSlots.flatMap((slot) =>
        slot.availableTimings.map((timing) => ({
          startTime: new Date(timing.startingTime),
          endTime: new Date(timing.endingTime),
        })),
      );

    if (minTimeDurationData) {
      setTimeSlots(
        generateTimeSlots(
          availableTimeSlots!,
          minTimeDurationData.minTimeDuration?.time!,
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
  }, [timeSlotsData, timeDuration, minTimeDurationData, selectedDate]);

 
  
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
      <div className="flex flex-wrap justify-between gap-y-5">
        <div className="mt-[10px] flex flex-wrap items-center gap-y-2">
          <button onClick={handlePrevDay} disabled={isPrevDisabled}>
            <svg
              width="12"
              height="13"
              viewBox="0 0 12 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12.5C7.60266 12.5 9.10938 11.8759 10.2427 10.7427C11.3759 9.60938 12 8.10266 12 6.5C12 4.89734 11.3759 3.39062 10.2427 2.25734C9.10938 1.12412 7.60266 0.5 6 0.5C4.39734 0.5 2.89062 1.12412 1.75734 2.25734C0.624118 3.39062 0 4.89734 0 6.5C0 8.10266 0.624118 9.60938 1.75734 10.7427C2.89062 11.8759 4.39734 12.5 6 12.5ZM6 1.4375C7.35225 1.4375 8.62355 1.96409 9.57973 2.92027C10.5359 3.87645 11.0625 5.14775 11.0625 6.5C11.0625 7.85225 10.5359 9.12355 9.57973 10.0797C8.62355 11.0359 7.35225 11.5625 6 11.5625C4.64777 11.5625 3.37645 11.0359 2.42027 10.0797C1.46409 9.12355 0.9375 7.85225 0.9375 6.5C0.9375 5.14775 1.46409 3.87645 2.42027 2.92027C3.37645 1.96409 4.64777 1.4375 6 1.4375ZM7.05788 9.31599L7.6538 8.59227L5.11275 6.5L7.6538 4.40773L7.05788 3.68401L3.63783 6.5L7.05788 9.31599Z"
                fill="#00898F"
              />
            </svg>
          </button>
          {days.map((day) => (
            <span
              key={day.toISOString()}
              className={`pb-[6px] font-inter font-normal xs:text-xs sm:text-sm 2xl:text-base ${
                format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                  ? " border-b-[2px] border-primary"
                  : ""
              }`}
              style={{
                margin: "0 10px",
                cursor: "pointer",
                boxSizing: "border-box",
                paddingBottom:
                  format(day, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd")
                    ? "2px"
                    : "6px",
              }}
              onClick={() => {
                handleDayClick(day);
              }}
            >
              {format(day, "d LLL")}
            </span>
          ))}

          <button onClick={handleNextDay}>
            <svg
              width="12"
              height="13"
              viewBox="0 0 12 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12.5C7.60266 12.5 9.10938 11.8759 10.2427 10.7427C11.3759 9.60938 12 8.10266 12 6.5C12 4.89734 11.3759 3.39062 10.2427 2.25734C9.10938 1.12412 7.60266 0.5 6 0.5C4.39734 0.5 2.89062 1.12412 1.75734 2.25734C0.624118 3.39062 0 4.89734 0 6.5C0 8.10266 0.624118 9.60938 1.75734 10.7427C2.89062 11.8759 4.39734 12.5 6 12.5ZM6 1.4375C7.35225 1.4375 8.62355 1.96409 9.57973 2.92027C10.5359 3.87645 11.0625 5.14775 11.0625 6.5C11.0625 7.85225 10.5359 9.12355 9.57973 10.0797C8.62355 11.0359 7.35225 11.5625 6 11.5625C4.64777 11.5625 3.37645 11.0359 2.42027 10.0797C1.46409 9.12355 0.9375 7.85225 0.9375 6.5C0.9375 5.14775 1.46409 3.87645 2.42027 2.92027C3.37645 1.96409 4.64777 1.4375 6 1.4375ZM4.94212 9.31599L4.3462 8.59227L6.88725 6.5L4.3462 4.40773L4.94212 3.68401L8.36217 6.5L4.94212 9.31599Z"
                fill="#00898F"
              />
            </svg>
          </button>
        </div>

        {/* add time */}
        <div className="mt-3 md:ml-4 md:w-[103px] xl:w-[136px]">
          <UIFormLabel className="font-inter text-sm font-medium text-active 2xl:text-base ">
            Add Time
          </UIFormLabel>

          <Select
            value={
              timeDuration?.toString() ||
              minTimeDurationData?.minTimeDuration?.time.toString()
            }
            onValueChange={(selectedValue: string) => {
              setTimeDuration(parseInt(selectedValue));
              onSelectDuration(
                parseInt(selectedValue) ||
                  minTimeDurationData?.minTimeDuration?.time!,
              );
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                className="placeholder:font-inter placeholder:text-xs placeholder:font-normal placeholder:text-inactive 2xl:placeholder:text-sm"
                placeholder="Select"
              />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                {timeDurations?.timeDurations.map((timeDuration) => (
                  <SelectItem
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
      <div className="mt-[18px] max-h-[78px] overflow-y-auto ">
        {timeSlots.length > 0 ? (
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
          <p>No available time slots.</p>
        )}
      </div>
    </>
  );
};

export default DayNavigatorWithTimeSlots;
