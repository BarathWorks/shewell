"use client";
import { Button } from "@repo/ui/src/@/components/button";
import { Calendar } from "@repo/ui/src/@/components/calendar";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  endOfDay,
  add,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import RescheduleAction from "~/app/actions/reschedule-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { filterAvailableTimeSlots } from "~/lib/utils";

interface ISelectDateTime {
  expertId: string;
  appointmentId: string;
  appointmentDate: Date;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  eventId: string;
  duration: number;
}

interface IRescheduleData {
  startingTime: Date;
  endingTime: Date;
  appointmentId: string;
  eventId?: string;
  professionalUserId?: string;
}

interface TimeSlot {
  availableTimings: {
    startingTime: Date;
    endingTime: Date;
  }[];
}
const schema = z.object({
  startingTime: z.date(),
  endingTime: z.date(),
  appointmentId: z.string(),
  eventId: z.string().optional(),
  professionalUserId: z.string().optional(),
});

const Reschedule = ({
  expertId,
  appointmentId,
  appointmentDate,
  open,
  duration,
  onOpenChange,
  eventId,
}: ISelectDateTime) => {
  type FormData = z.infer<typeof schema>;

  const { handleSubmit, control, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const trpcContext = api.useUtils();

  const { toast } = useToast();
  const onSubmit = (data: IRescheduleData) => {
    const updatedData = data;
    (updatedData.eventId = eventId!),
      (updatedData.professionalUserId = expertId!);
  

    RescheduleAction(updatedData)
      .then((resp) => {
        toast({
          description: resp.message,
          variant: "default",
        });
        trpcContext.invalidate();
        onOpenChange(false);
      })
      .catch((err) => {
        toast({
          description: "Failed to reschedule the appointment",
          variant: "destructive",
        });
        console.log(err.message);
      });
  };

  const [date, setDate] = useState<Date | undefined>(appointmentDate);

  // const [timeSlots, setTimeSlots] = useState<
  //   { startTime: Date; endTime: Date }[]
  // >([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeDuration, setTimeDuration] = useState<number | null>(duration);
  const formatDate = endOfDay(new Date(date!));
  const { data, refetch } = api.searchTimeSlots.searchTimeSlots.useQuery(
    {
      date: formatDate!,
      expertId: expertId,
    },
    { enabled: false },
  );

  useEffect(() => {
    setTimeDuration(duration);
  }, [duration]);

 

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

  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startingTime: Date;
    endingTime: Date;
  } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledDays = { before: today };

  useEffect(() => {
    if (date) {
      refetch();
    }
  }, [date, refetch]);

  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [date]);


  useEffect(() => {
    setDate(appointmentDate);
  }, [appointmentDate]);

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

  //latest working generate time slots from counselling
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

    const roundMinutes = (date: Date): Date => {
      const roundedDate = new Date(date);
      const minutes = roundedDate.getMinutes();
      
      if (minutes >= 1 && minutes <= 9) {
        roundedDate.setMinutes(10);
      } else if (minutes >= 11 && minutes <= 19) {
        roundedDate.setMinutes(20);
      } else if (minutes >= 21 && minutes <= 29) {
        roundedDate.setMinutes(30);
      } else if (minutes >= 31 && minutes <= 39) {
        roundedDate.setMinutes(40);
      } else if (minutes >= 41 && minutes <= 49) {
        roundedDate.setMinutes(50);
      } else if (minutes >= 51 && minutes <= 59) {
        roundedDate.setHours(roundedDate.getHours() + 1);
        roundedDate.setMinutes(0);
      }
      
      return roundedDate;
    };

    timeSlots?.forEach((slot) => {
      let currentTime = roundMinutes(new Date(slot.startTime));
      const endTime = roundMinutes(new Date(slot.endTime));

      const isToday = currentTime.toDateString() === now.toDateString();

      if (isToday && currentTime < add(now, { hours: 2 })) {
        currentTime = roundMinutes( add(now, { hours: 2 }));
      }

      while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
        const startTime = new Date(currentTime)
        const endingTime = roundMinutes(new Date(currentTime.getTime() + duration * 60000));
        generatedTimeSlots.push({
          availableTimings: [
            {
              startingTime: startTime,
              endingTime: endingTime,
            },
          ],
        });
        currentTime = roundMinutes(new Date(currentTime.setMinutes(currentTime.getMinutes() + duration)));
      }
    });

    return generatedTimeSlots;
  };

  
  const setSlotWithDate = (slot: { startingTime: Date; endingTime: Date }) => {
    if (date) {
      const startDateTime = new Date(date);
      startDateTime.setHours(slot.startingTime.getHours());
      startDateTime.setMinutes(slot.startingTime.getMinutes());
      startDateTime.setSeconds(0);
      startDateTime.setMilliseconds(0);

      const endDateTime = new Date(date);
      endDateTime.setHours(slot.endingTime.getHours());
      endDateTime.setMinutes(slot.endingTime.getMinutes());
      endDateTime.setSeconds(0);
      endDateTime.setMilliseconds(0);

      return { startingTime: startDateTime, endingTime: endDateTime };
    }
    return slot;
  };

  const filteredBookedSlotsFromTimeSlots = filterAvailableTimeSlots(
    timeSlots,
    data?.bookedSlots ?? [],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex w-full flex-col gap-6 p-3 xl:flex-row ">
            <Calendar
              disabled={disabledDays}
              mode="single"
              selected={date}
              onSelect={setDate}
              className={`rounded-md border`}
            />
            <div className="flex flex-col gap-6">
              <div className="border-b-[2px] pb-[5px] font-inter text-base font-medium lg:text-[20px] lg:leading-[30px]">
                Available Time Slots
              </div>
              {/* <div className="flex h-[85px] flex-wrap items-center justify-center gap-4 overflow-y-scroll">
                {generateTimeSlots().map((slot, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-md border border-primary px-2 py-[6px] font-inter text-sm ${
                      selectedTimeSlot &&
                      selectedTimeSlot.startTime.getTime() ===
                        new Date(slot.startTime).getTime() &&
                      selectedTimeSlot.endTime.getTime() ===
                        new Date(slot.endTime).getTime()
                        ? "bg-primary text-white"
                        : "bg-white text-black hover:bg-primary hover:text-white"
                    }`}
                    onClick={() => {
                      const updatedSlot = setSlotWithDate(slot);
                      setSelectedTimeSlot(updatedSlot);
                      setValue("startingTime", updatedSlot.startTime); // Set starting time in form
                      setValue("endingTime", updatedSlot.endTime); // Set ending time in form
                      setValue("appointmentId", appointmentId);
                      // console.log("Selected Slot:", updatedSlot); // Log the selected slot
                    }}
                  >
                    {formatTimeSlot(
                      slot.startTime.toString(),
                      slot.endTime.toString(),
                    )}
                  </div>
                ))}
              </div> */}
              <div className="flex h-[85px] flex-wrap items-center justify-center gap-4 overflow-y-scroll">
                {filteredBookedSlotsFromTimeSlots.length > 0
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
                                const updatedSlot = setSlotWithDate(timing);
                                setSelectedTimeSlot(updatedSlot);
                                setValue(
                                  "startingTime",
                                  updatedSlot.startingTime,
                                ); // Set starting time in form
                                setValue("endingTime", updatedSlot.endingTime); // Set ending time in form
                                setValue("appointmentId", appointmentId);
                                // console.log("Selected Slot:", updatedSlot); // Log the selected slot
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
                  : "There are no time slots for this date"}
              </div>
              <Button
                disabled={!selectedTimeSlot}
                type="submit"
                className="self-end rounded-md bg-secondary px-[30px] py-2 font-inter text-base font-medium hover:bg-secondary"
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default Reschedule;
