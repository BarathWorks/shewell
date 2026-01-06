

"use client";
import { Button } from "@repo/ui/src/@/components/button";
import { Calendar } from "@repo/ui/src/@/components/calendar";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { format, endOfDay, add, isToday } from "date-fns";
import {
  addDays,
  subDays,
  startOfToday,
  isAfter,
  isBefore,
  getHours,
  getMinutes,
} from "date-fns";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { createTimeDate, createTimeDateSeconds, filterAvailableTimeSlots } from "~/lib/utils";

interface ISelectDateTime {
  expertId: string;
  onPrice: (priceInCents: number) => void;
  defaultDuration: number;
  defaultDate: Date;
  defaultTimeSlots: { startTime: Date; endTime: Date };
  onSelectDuration: (value: number) => void;
  onSelectDateTime: (
    date: Date,
    timeSlots: { startTime: Date; endTime: Date },
  ) => void;
  isActive: boolean;
  onNextStep: () => void;
  defaultCouple: boolean;
}
interface TimeSlot {
  availableTimings: {
    startTime: Date;
    endTime: Date;
  }[];
}
const SelectDateTime = ({
  expertId,
  onSelectDateTime,
  onSelectDuration,
  isActive,
  onPrice,
  onNextStep,
  defaultDuration,
  defaultDate,
  defaultTimeSlots,
  defaultCouple,
}: ISelectDateTime) => {
  const [date, setDate] = useState<Date | undefined>(defaultDate || new Date());
  const [duration, setDuration] = useState<number>(defaultDuration);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  // const [timeSlots, setTimeSlots] = useState<
  //   { startTime: Date; endTime: Date }[]
  // >([]);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const setSecondsToZeroDefaultTimeSlots = {
    startTime : createTimeDateSeconds(getHours(defaultTimeSlots.startTime), getMinutes(defaultTimeSlots.startTime), new Date(defaultTimeSlots.startTime)),
    endTime : createTimeDateSeconds(getHours(defaultTimeSlots.endTime), getMinutes(defaultTimeSlots.endTime), new Date(defaultTimeSlots.endTime))
  }
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: Date;
    endTime: Date;
  } | null>(setSecondsToZeroDefaultTimeSlots);
  const initialLoad = useRef(true);
  const formatDate = endOfDay(new Date(date!));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledDays = { before: today };



  useEffect(() => {
    if (duration === defaultDuration) {
     
      setSelectedTimeSlot(defaultTimeSlots);
      // console.log("selected time slot", selectedTimeSlot)
    } else {
      

      setSelectedTimeSlot(null);
      //  console.log("selected time slot", selectedTimeSlot)
    }
  }, [duration]);
  useEffect(() => {
   
  }, [selectedTimeSlot]);

  useEffect(() => {
    setSelectedTimeSlot(defaultTimeSlots)
  },[defaultTimeSlots])

  const { data, refetch, isLoading } =
    api.searchTimeSlots.searchTimeSlots.useQuery(
      {
        date: formatDate!,
        expertId: expertId,
      },
      { enabled: false },
    );

  const { data: timeDurations } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: expertId,
    });

  const { data: price } = api.findPrice.findPrice.useQuery(
    {
      duration: duration!,
      expertId: expertId,
      // couple : defaultCouple
    },
    {
      enabled: !!duration,
    },
  );

  const { data: priceForCouple } =
    api.findPriceForCouple.findPriceForCouple.useQuery(
      {
        duration: duration!,
        expertId: expertId,
        // couple : defaultCouple
      },
      {
        enabled: !!duration,
      },
    );

  useEffect(() => {
    if (defaultCouple === false) {
      if (price && price.price?.priceInCentsForSingle !== selectedPrice) {
        setSelectedPrice(price.price?.priceInCentsForSingle!);
        onPrice(price.price?.priceInCentsForSingle!);
      }
    } else {
      if (
        priceForCouple &&
        priceForCouple.price?.priceInCentsForCouple !== selectedPrice
      ) {
        setSelectedPrice(priceForCouple.price?.priceInCentsForCouple!);
        onPrice(priceForCouple.price?.priceInCentsForCouple!);
      }
    }
  }, [price, onPrice]);

  useEffect(() => {
    if (date) {
      refetch();
    }
  }, [date, refetch]);

  useEffect(() => {
    const availableTimeSlots =
      data &&
      data.timeSlots.flatMap((slot) =>
        slot.availableTimings.map((timing) => ({
          startTime: timing.startingTime,
          endTime: timing.endingTime,
        })),
      );
    if (duration) {
      // const generatedTimeSlots = generateTimeSlots(availableTimeSlots, duration)
      // setTimeSlots(availableTimeSlots);
      setTimeSlots(generateTimeSlots(availableTimeSlots!, duration));
    }
  }, [data, date, duration]);
  useEffect(() => {
    setDate(date);
  }, [date]);
 
  const handleTimeSlot = (selectedTimeSlot: {
    startTime: Date;
    endTime: Date;
  }) => {
    setSelectedTimeSlot(selectedTimeSlot);
    onSelectDateTime(date!, selectedTimeSlot);
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString([], options)}`;
  };

  const refactoredTimeSlots = timeSlots.map((item) => ({
    availableTimings : item.availableTimings.map((items) => ({
      startingTime : items.startTime,
      endingTime : items.endTime
    }))
  }))
  const filteredBookedSlotsFromTimeSlots = filterAvailableTimeSlots(
    refactoredTimeSlots, data?.bookedSlots!
  )
 
  

  const generateTimeSlots = (
    timeSlots: { startTime: Date; endTime: Date }[],
    duration: number,
  ): TimeSlot[] => {
    const generatedTimeSlots: TimeSlot[] = [];
    const now = new Date();

    timeSlots?.forEach((slot) => {
      let currentTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      const isToday = currentTime.toDateString() === now.toDateString();

      if (isToday && currentTime < add(now, { hours: 2 })) {
        currentTime = add(now, { hours: 2 });
      }

      while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
        generatedTimeSlots.push({
          availableTimings: [
            {
              startTime: new Date(currentTime),
              endTime: new Date(currentTime.getTime() + duration * 60000),
            },
          ],
        });
        currentTime.setMinutes(currentTime.getMinutes() + duration);
      }
    });

    return generatedTimeSlots;
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 p-3 xl:flex-row ">
        <Calendar
          disabled={disabledDays}
          mode="single"
          selected={date}
          onSelect={setDate}
          className="self-center rounded-md border"
        />

        <div className="flex flex-col gap-6">
          <div className="md:w-[103px] xl:w-[136px]">
            <UIFormLabel className="font-inter text-sm font-medium text-active 2xl:text-base">
              Add Time
            </UIFormLabel>

            <Select
              value={duration?.toString()}
              onValueChange={(selectedValue: string) => {
               
                setDuration(parseInt(selectedValue));
                onSelectDuration(parseInt(selectedValue));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  className="placeholder:font-inter placeholder:text-xs placeholder:font-normal placeholder:text-inactive 2xl:placeholder:text-sm"
                  placeholder="e.g 30min"
                />
              </SelectTrigger>

              <SelectContent className="bg-white">
                {timeDurations?.timeDurations.map((duration) => (
                  <SelectItem
                    key={duration.time}
                    value={duration.time.toString()}
                  >
                    {duration.time} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-b-[2px] pb-[5px] font-inter text-base font-medium lg:text-[20px] lg:leading-[30px]">
            Available Time Slots
          </div>

          <div className="h-[80px] overflow-y-auto">
            <div className="flex  flex-wrap gap-4 ">
              {/* {timeSlots.map((slot, index) => (
              <div
                key={index}
                className={`cursor-pointer rounded-md border border-primary px-2 py-[6px] font-inter text-sm ${
                  // selectedTimeSlot &&
                  // selectedTimeSlot.startTime.getTime() ===
                  //   new Date(slot.startTime).getTime() &&
                  // selectedTimeSlot.endTime.getTime() ===
                  //   new Date(slot.endTime).getTime()
                  //   ? "bg-primary text-white"
                  //   : !selectedTimeSlot &&
                  //     defaultTimeSlots.startTime.getTime() ===
                  //       new Date(slot.startTime).getTime() &&
                  //     defaultTimeSlots.endTime.getTime() ===
                  //       new Date(slot.endTime).getTime()
                  //   ? "bg-primary text-white"
                  //   : "bg-white text-black hover:bg-primary hover:text-white"

                  selectedTimeSlot &&
                  selectedTimeSlot.startTime.getTime() ===
                    new Date(slot.startTime).getTime() &&
                  selectedTimeSlot.endTime.getTime() ===
                    new Date(slot.endTime).getTime()
                    ? "bg-primary text-white"
                    : "bg-white text-black hover:bg-primary hover:text-white"
                }`}
                onClick={() => {
                  handleTimeSlot(slot);
                }}
              >
                {formatTimeSlot(
                  slot.startTime.toString(),
                  slot.endTime.toString(),
                )}
              </div>
            ))} */}

              {isLoading
                ? "Loading..."
                : filteredBookedSlotsFromTimeSlots.length > 0
                  ? filteredBookedSlotsFromTimeSlots.map((slot, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        {slot.availableTimings.map((timing, idx) => (
                          <div key={idx} className="flex items-center">
                            <span
                              className={`cursor-pointer rounded-md border border-primary px-2 py-1 font-inter text-sm font-medium text-black hover:bg-primary hover:text-white ${
                                selectedTimeSlot?.startTime === timing.startingTime && selectedTimeSlot.endTime === timing.endingTime
                                  ? "bg-primary text-white"
                                  : "bg-white text-black hover:bg-primary hover:text-white"
                              }`}
                              onClick={() => {
                                const updatedTiming = {
                                  startTime : timing.startingTime,
                                  endTime : timing.endingTime
                                }
                                handleTimeSlot(updatedTiming),
                                  console.log(
                                    " selectedTimeSlotStartTime",
                                    createTimeDateSeconds(
                                    getHours(selectedTimeSlot?.startTime!),
                                    getMinutes(selectedTimeSlot?.startTime!),
                                    new Date(selectedTimeSlot?.startTime!),
                                  ) ,
                                  
                                    // "createTimeDateStartingTime",
                                    createTimeDateSeconds(
                                      getHours(timing.startingTime),
                                      getMinutes(timing.startingTime),
                                      new Date(timing.startingTime),
                                    ) , 
                                 
                                    // " selectedTimeSlotEndTime",
                                    createTimeDateSeconds(
                                      getHours(selectedTimeSlot?.endTime!),
                                      getMinutes(selectedTimeSlot?.endTime!),
                                      new Date(selectedTimeSlot?.endTime!),
                                    )   ,
                                    // "createTimeDateEndDate",
                                    createTimeDateSeconds(
                                      getHours(timing.endingTime),
                                      getMinutes(timing.endingTime),
                                      new Date(timing.endingTime),
                                    ),
                                  );
                              }}
                            >
                              {formatTimeSlot(
                                timing.startingTime.toString(),
                                timing.endingTime.toString(),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))
                  : "There are no appointments for this date"}
            </div>
          </div>
          <Button
            className="self-end rounded-md bg-secondary px-[30px] py-2 font-inter text-base font-medium hover:bg-secondary"
            onClick={onNextStep}
            disabled={
              // !isActive ||
              selectedTimeSlot === null
            }
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default SelectDateTime;
