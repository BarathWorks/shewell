"use client";
import { Button } from "@repo/ui/src/@/components/button";
import { Calendar } from "@repo/ui/src/@/components/calendar";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { format, compareAsc, endOfDay, add } from "date-fns";
import { useToast } from "@repo/ui/src/@/components/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";

import UIFormLabel from "@repo/ui/src/@/components/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { AppointmentType } from "@repo/database";
import CheckoutAction from "~/app/actions/checkout-action";
import { makePayment } from "~/lib/razorpay-payment";
import { filterAvailableTimeSlots } from "~/lib/utils";
import { env } from "~/env";

interface ISelectDateTime {
  expertId: string;
  appointmentId: string;
  patientId: string;
  patientMessage: string;
  patientFirstName: string;
  patientEmail: string;
  patientPhoneNumber: string;
  isCouple: boolean;
  additionalPatients: {
    firstName: string;
    phoneNumber: string;
    email: string;
  }[];
  open: boolean;
  defaultDuration: number;
  onOpenChange: (value: boolean) => void;
  //   onPrice: (priceInCents: number) => void;
  //   onSelectDateTime: (
  //     date: Date,
  //     timeSlots: { startTime: Date; endTime: Date }[],
  //   ) => void;
  //   isActive: boolean;
  //   onNextStep: () => void;
}

const Rebook = ({
  expertId,
  appointmentId,
  patientId,
  patientMessage,
  patientFirstName,
  patientEmail,
  patientPhoneNumber,
  additionalPatients,
  open,
  onOpenChange,
  isCouple,
  defaultDuration,
  //  onSelectDateTime,
  //   onPrice
}: ISelectDateTime) => {
  interface TimeSlot {
    availableTimings: {
      startingTime: Date;
      endingTime: Date;
    }[];
  }

  const [date, setDate] = useState<Date | undefined>(new Date());

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeDuration, setTimeDuration] = useState<number | null>(
    defaultDuration,
  );
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startingTime: Date;
    endingTime: Date;
  } | null>(null);
  useEffect(() => {
    setTimeDuration(defaultDuration);
  }, [defaultDuration]);
  const formatDate = endOfDay(new Date(date!));

  // getting today's date
  const today = new Date();
  // set time to start of the day so that time will not create issue because we only want to compare the days
  today.setHours(0, 0, 0, 0);
  // setting matcher , before comes from react daypicker library which gives all the day before the particular date
  const disabledDays = { before: today };
  const { data, refetch, isLoading } =
    api.searchTimeSlots.searchTimeSlots.useQuery(
      {
        date: formatDate!,
        expertId: expertId,
      },
      // { enabled: false },
    );


  // fetching time durations of the professional user i.e doctor
  const { data: timeDurations } =
    api.appointmentTimeDuration.appointmentTimeDuration.useQuery({
      professionalUserId: expertId,
    });

  const { data: price } = api.findPrice.findPrice.useQuery(
    {
      duration: timeDuration!,
      expertId: expertId,
    },
    {
      // whenever the duration changes api will fetch price
      enabled: !!timeDuration,
    },
  );

  const { data: priceForCouple, refetch: refetchPriceForCouple } =
    api.findPriceForCouple.findPriceForCouple.useQuery(
      {
        duration: timeDuration!,
        expertId: expertId,
        // couple: defaultCouple
      },
      {
        // whenever the duration changes api will fetch price
        enabled: !!timeDuration,
      },
    );

  //   console.log("price", price);
  //   console.log("price", selectedPrice);
  useEffect(() => {
    if (isCouple === true) {
      if (priceForCouple && priceForCouple.price?.priceInCentsForCouple) {
        setSelectedPrice(priceForCouple.price.priceInCentsForCouple);
      }
    } else {
      if (price && price.price?.priceInCentsForSingle) {
        setSelectedPrice(price.price.priceInCentsForSingle);
      }
    }
  }, [price, priceForCouple]);

  // Refetch the time slots whenever selected date changes
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
          startTime: new Date(timing.startingTime),
          endTime: new Date(timing.endingTime),
        })),
      );

    if (timeDuration) {
      const currentTime = new Date();

      if (timeDuration) {
        
        setTimeSlots(generateTimeSlots(availableTimeSlots!, timeDuration));
      }
    }
  }, [data, timeDuration]);

  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [date]);
  const handleTimeSlot = (
    selectedTimeSlot: {
      startingTime: Date;
      endingTime: Date;
    },
    priceInCents: number,
  ) => {
    setSelectedTimeSlot(selectedTimeSlot);
    setSelectedPrice(priceInCents);
    // onSelectDateTime(date!, [selectedTimeSlot]);
  
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString(
      [],
      options,
    )}`;
  };

  // Generate time slots  working and original based on the selected duration
  

  // latest working Generate time slots from counselling
  // const generateTimeSlots = (
  //   timeSlots: { startTime: Date; endTime: Date }[],
  //   duration: number,
  // ): TimeSlot[] => {
  //   const generatedTimeSlots: TimeSlot[] = [];
  //   console.log("timeSlotsInGeneratedTimeSlot", timeSlots);
  //   timeSlots?.forEach((slot) => {
  //     let currentTime = new Date(slot.startTime);
  //     const endTime = new Date(slot.endTime);

  //     while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
  //       generatedTimeSlots.push({
  //         availableTimings: [
  //           {
  //             startingTime: new Date(currentTime),
  //             endingTime: new Date(currentTime.getTime() + duration * 60000),
  //           },
  //         ],
  //       });
  //       currentTime.setMinutes(currentTime.getMinutes() + duration);
  //     }
  //   });
  //   console.log("generatedTimeSlots", generatedTimeSlots);
  //   return generatedTimeSlots;
  // };

  const generateTimeSlots = (
    timeSlots: { startTime: Date; endTime: Date }[],
    duration: number,
  ): TimeSlot[] => {
    const generatedTimeSlots: TimeSlot[] = [];
    const now = new Date();

    const roundMinute = (date: Date): Date => {
      const rounded = new Date(date);
      const minutes = rounded.getMinutes();
      
      if (minutes >= 1 && minutes <= 9) {
        rounded.setMinutes(10);
      } else if (minutes >= 11 && minutes <= 19) {
        rounded.setMinutes(20);
      } else if (minutes >= 21 && minutes <= 29) {
        rounded.setMinutes(30);
      } else if (minutes >= 31 && minutes <= 39) {
        rounded.setMinutes(40);
      } else if (minutes >= 41 && minutes <= 49) {
        rounded.setMinutes(50);
      } else if (minutes >= 51 && minutes <= 59) {
        rounded.setMinutes(0);
        rounded.setHours(rounded.getHours() + 1);
      }
      
      return rounded;
    };
    timeSlots?.forEach((slot) => {
      let currentTime = roundMinute(new Date(slot.startTime));
      const endTime = roundMinute(new Date(slot.endTime));

      const isToday = currentTime.toDateString() === now.toDateString();

      if (isToday && currentTime < add(now, { hours: 2 })) {
        currentTime = roundMinute(add(now, { hours: 2 }));
      }

      while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
        const startTime = new Date(currentTime);
        const endingTime = roundMinute(new Date(currentTime.getTime() + duration * 60000));
        generatedTimeSlots.push({
          availableTimings: [
            {
              startingTime: startTime,
              endingTime: endingTime,
            },
          ],
        });
        const nextTime = new Date(currentTime);
        nextTime.setMinutes(nextTime.getMinutes() + duration);
        currentTime = roundMinute(nextTime);
      }
    });

    return generatedTimeSlots;
  };

  const { toast } = useToast();
  const [close, setClose] = useState<boolean>();

  const taxedAmount = (parseInt(env.NEXT_PUBLIC_GST)/100)*selectedPrice
      const totalPriceInCents = selectedPrice + (parseInt(env.NEXT_PUBLIC_GST)/100)*selectedPrice
  const submitData = {
    serviceMode: {
      serviceType: AppointmentType.ONLINE,
      priceInCents: selectedPrice,
      taxedAmount : taxedAmount,
      totalPriceInCents : totalPriceInCents,
      description:
        "Online (Virtual appointment) with doctor through Google Meet or Zoom.",
      planName: "Basic Plan",
    },
    professionalUser: {
      professionalUserId: expertId,
    },
    patient: {
      id: patientId,
      message: patientMessage,
      firstName: patientFirstName,
      email: patientEmail,
      phoneNumber: patientPhoneNumber,
      additionalPatients: additionalPatients,
    },
    startingTime: selectedTimeSlot?.startingTime!,
    endingTime: selectedTimeSlot?.endingTime!,
  };
  const trpcContext = api.useUtils();
  const submit = async () => {
    makePayment(submitData).then(() => {
      trpcContext.invalidate();
      onOpenChange(false);
    });
  };

  const filteredBookedSlotsFromTimeSlots = filterAvailableTimeSlots(
    timeSlots,
    data?.bookedSlots ?? [],
  );

  return (
    <>
      <Dialog
        //  open={close} onOpenChange={setClose}
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <div className="flex w-full flex-col gap-6 p-3 xl:flex-row ">
            <Calendar
              disabled={disabledDays}
              mode="single"
              selected={date}
              onSelect={setDate}
              className={` rounded-md border`}
            />

            <div className="flex flex-col gap-6">
              <div className="md:w-[103px] xl:w-[136px]">
                <UIFormLabel className="font-inter text-sm font-medium text-active 2xl:text-base">
                  Add Time
                </UIFormLabel>

                <Select
                  value={timeDuration ? timeDuration.toString() : "30"} // Ensure the value is a string
                  onValueChange={(selectedValue: string) => {
                    setTimeDuration(parseInt(selectedValue));
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

              <div className="flex h-[100px] flex-wrap    gap-4 overflow-y-scroll">
                {/* {generateTimeSlots().map((slot, index) => (
                  <div
                    key={index}
                    className={` cursor-pointer rounded-md border border-primary px-2 py-[6px] font-inter text-sm ${
                      selectedTimeSlot &&
                      selectedTimeSlot.startTime.getTime() ===
                        new Date(slot.startTime).getTime() &&
                      selectedTimeSlot.endTime.getTime() ===
                        new Date(slot.endTime).getTime()
                        ? "bg-primary text-white"
                        : "bg-white text-black hover:bg-primary hover:text-white"
                    }`}
                    onClick={() => {
                      handleTimeSlot(slot, selectedPrice);
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
                                  selectedTimeSlot &&
                                  selectedTimeSlot.startingTime.getTime() ===
                                    new Date(timing.startingTime).getTime() &&
                                  selectedTimeSlot.endingTime.getTime() ===
                                    new Date(timing.endingTime).getTime()
                                    ? "bg-primary text-white"
                                    : "bg-white text-black hover:bg-primary hover:text-white"
                                }`}
                                onClick={() => {
                                  handleTimeSlot(timing, selectedPrice);
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
              <Button
                disabled={!selectedTimeSlot}
                onClick={() => submit()}
                className="self-end rounded-md bg-secondary px-[30px] py-2 font-inter text-base font-medium hover:bg-secondary"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Rebook;
