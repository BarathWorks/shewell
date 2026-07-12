"use client";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@repo/ui/src/@/components/sheet";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import { Button } from "@repo/ui/src/@/components/button";
import { Day } from "@repo/database";
import AvailabilityTimings from "./availability-timings";
import { IAvailability } from "~/models/availability.model";
import AppointmentUserAction from "./appointment-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { createTime, dateToITimeValue } from "../lib/utils";
import { TZDate } from "@date-fns/tz";

// interface ITimeValue {
//   hour: number;
//   minute: number;
// }
interface IAvailaibleTimings {
  startingTime: Date;
  endingTime: Date;
}
interface IAvailabilities {
  available: boolean;
  day: Day;
  availableTimings: IAvailaibleTimings[];
}
const timeValueSchema = z.object({
  hour: z.number(),
  minute: z.number(),
});

// const schema = z.object({
//   availability: z.array(
//     z.object({
//       available: z.boolean(),
//       day: z.nativeEnum(Day),
//       availableTimings: z.array(
//         z
//           .object({
//             startingTime: timeValueSchema,
//             endingTime: timeValueSchema,
//           })
//           .refine(
//             (data) => {
//               const start = new Date(
//                 0,
//                 0,
//                 0,
//                 data.startingTime.hour,
//                 data.startingTime.minute,
//               );
//               const end = new Date(
//                 0,
//                 0,
//                 0,
//                 data.endingTime.hour,
//                 data.endingTime.minute,
//               );
//               return start < end;
//             },
//             {
//               message: "Starting time must be less than ending time",
//             },
//           ),
//       ),
//       // .refine((data => data.map((item) => item.endingTime < item.startingTime)) ,{message : "Starting Time should be greater than ending time", path:['startingTime']}),
//     }),
//   ),
// });

const schema = z.object({
  availability: z.array(
    z.object({
      available: z.boolean(),
      day: z.nativeEnum(Day),
      availableTimings: z
        .array(
          z.object({
            startingTime: timeValueSchema,
            endingTime: timeValueSchema,
          }).refine(
            (data) => {
              const start = new Date(
                0,
                0,
                0,
                data.startingTime.hour,
                data.startingTime.minute
              );
              const end = new Date(
                0,
                0,
                0,
                data.endingTime.hour,
                data.endingTime.minute
              );
              return start < end;
            },
            {
              message: "Starting time must be less than ending time",
            }
          )
        )
        .refine(
          (timings) => {
            for (let i = 1; i < timings.length; i++) {
              const prevEnd = new Date(
                0,
                0,
                0,
                timings[i - 1]?.endingTime.hour,
                timings[i - 1]?.endingTime.minute
              );
              const currStart = new Date(
                0,
                0,
                0,
                timings[i]?.startingTime.hour,
                timings[i]?.startingTime.minute
              );
              if (currStart <= prevEnd) {
                return false;
              }
            }
            return true;
          },
          {
            message:
              "Each starting time must be greater than the previous ending time",
          }
        ),
    })
  ),
});
interface AppointmentSettingsProps {
  availabilities: IAvailabilities[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AppointmentSettings = ({
  availabilities,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AppointmentSettingsProps) => {
  // const transformedAvailabilities = availabilities.map((availability) => ({
  //   ...availability,
  //   availableTimings: availability.availableTimings.map((timing) => ({
  //     ...timing,
  //     startingTime: dateToITimeValue(
  //       new Date(timing.startingTime.toUTCString()),
  //     ),
  //     endingTime: dateToITimeValue(new Date(timing.endingTime.toUTCString())),
  //   })),
  // }));

  const transformedAvailabilities = availabilities.map((availability) => ({
  ...availability,
  availableTimings: availability.availableTimings.map((timing) => ({
    ...timing,
    startingTime: {
      hour: timing.startingTime.getHours(),
      minute: timing.startingTime.getMinutes()
    },
    endingTime: {
      hour: timing.endingTime.getHours(),
      minute: timing.endingTime.getMinutes()
    }
  })),
}));
  console.log("availabilities", availabilities);
  console.log("transformedAvailabilities", transformedAvailabilities);
  const defaultValues =
    availabilities.length > 0
      ? transformedAvailabilities
      : [
          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 20 },
                endingTime: { hour: 10, minute: 0 },
              },
            ],
            day: Day.SUN,
          },

          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 10 },
                endingTime: { hour: 10, minute: 20 },
              },
            ],
            day: Day.MON,
          },

          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 10 },
                endingTime: { hour: 10, minute: 20 },
              },
            ],
            day: Day.TUE,
          },

          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 10 },
                endingTime: { hour: 10, minute: 20 },
              },
            ],
            day: Day.WED,
          },

          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 10 },
                endingTime: { hour: 10, minute: 20 },
              },
            ],
            day: Day.THU,
          },

          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 10 },
                endingTime: { hour: 10, minute: 20 },
              },
            ],
            day: Day.FRI,
          },

          {
            available: true,
            availableTimings: [
              {
                startingTime: { hour: 9, minute: 10 },
                endingTime: { hour: 10, minute: 20 },
              },
            ],
            day: Day.SAT,
          },
        ];
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState,
  } = useForm<IAvailability>({
    // defaultValues: {
    //   availability: Object.keys(Day).map((key) => ({
    //     available: true,
    //     day: Day[key as keyof typeof Day],
    //     availabilityTimings: [
    //       {
    //         startingTime: { hour: 9, minute: 0 },
    //         endTime: { hour: 10, minute: 0 },
    //       },
    //     ],
    //   })),
    // },
    defaultValues: {
      availability: defaultValues,
    },
    resolver: zodResolver(schema),
  });
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;
  const { fields } = useFieldArray({ control, name: "availability" });
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = (data: z.infer<typeof schema>) => {
    const modifiedData = {
      availability: data.availability.map((avail) => ({
        available: avail.available,
        day: avail.day,
        availableTimings: avail.availableTimings.map((timing) => ({
          startingTime: createTime(
            timing.startingTime.hour,
            timing.startingTime.minute,
          ),
          endingTime: createTime(
            timing.endingTime.hour,
            timing.endingTime.minute,
          ),
        })),
      })),
    };

    console.log("modified data", modifiedData)
    AppointmentUserAction(modifiedData)
      .then((resp) => {
        console.log("appointment", resp?.message);
        toast({
          description: resp?.message,
          variant: "default",
        });
        setOpen(false);
        router.push("/doctor-profile");
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: err.message,
          variant: "destructive",
        });
      });
  };

  const errorHandler = (e: any) => console.log("error", e);

  return (
    <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
      {controlledOpen === undefined && (
        <SheetTrigger>
          <div className="rounded-xl bg-white px-[18px] py-2.5 font-poppins text-sm font-semibold text-[#0E3A47] shadow-md transition-all duration-300 hover:bg-[#A5F3FC] hover:shadow-lg md:px-5 md:text-base">
            Add your slots
          </div>
        </SheetTrigger>
      )}
      <SheetContent side="signup" className="h-full overflow-y-auto bg-gradient-to-b from-white to-[#F8FFFE] max-w-[587px] p-0">
        <form onSubmit={handleSubmit(onSubmit, errorHandler)}>
          {/* Header with gradient */}
          <div className="sticky top-0 z-10 bg-primary px-6 py-5 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-poppins text-xl font-bold text-white lg:text-2xl">
                  Weekly Hours
                </h2>
                <p className="mt-1 font-poppins text-sm text-white/70">
                  These timings will repeat every week
                </p>
              </div>
              <SheetClose className="rounded-full bg-white/10 p-2 transition-all duration-300 hover:bg-white/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </SheetClose>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 py-5">
            {fields.map((dayField, dayIndex) => (
              <div 
                key={dayField.id} 
                className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Controller
                    name={`availability.${dayIndex}.available`}
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                      </label>
                    )}
                  />
                  <div className="font-poppins text-base font-semibold text-[#0E3A47]">
                    {dayField.day}
                  </div>
                  {!watch(`availability.${dayIndex}.available`) && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-poppins text-xs font-medium text-gray-500">
                      Unavailable
                    </span>
                  )}
                </div>
                {watch(`availability.${dayIndex}.available`) && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <AvailabilityTimings
                      control={control}
                      index={dayIndex}
                      getValues={getValues}
                      setValue={setValue}
                      watch={watch}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 border-t border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-sm">
            <Button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 font-poppins text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
            >
              Save Weekly Schedule
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AppointmentSettings;
