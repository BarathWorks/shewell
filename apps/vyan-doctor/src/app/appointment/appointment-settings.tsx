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
import { Button } from "~/components/ui/button";
import { buttonClass } from "~/components/ui/button-styles";
import { CalendarClock, X } from "lucide-react";

/**
 * The rows were labelled with the raw enum member — "SUN", "MON". Legible, but it
 * is the database's spelling, not the practitioner's.
 */
const DAY_LABELS: Record<string, string> = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};
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
const AppointmentSettings = ({
  availabilities,
}: {
  availabilities: IAvailabilities[];
}) => {
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
  const [open, setOpen] = useState<boolean>(false);
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
      {/*
        Styled for the teal banner it used to sit on — white background, white
        text on hover. With the banner gone it was a white button on a white
        page. It is the app's outline button now, and it says what it opens:
        "Add your slots" described neither the weekly template it edits nor the
        fact that it is where hours are *removed* too.

        The class goes on the trigger itself rather than on a `<span>` inside it,
        so there is one element rather than a bare button wrapping a styled span.
        A 60-line commented-out gear `<svg>` also lived here.
      */}
      <SheetTrigger className={buttonClass({ variant: "outline", size: "md" })}>
        <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
        Weekly hours
      </SheetTrigger>
      <SheetContent side="signup" className="h-full max-w-[36rem] overflow-y-auto bg-canvas p-0">
        <form onSubmit={handleSubmit(onSubmit, errorHandler)}>
          {/* Header with gradient */}
          <div className="sticky top-0 z-10 border-b border-hairline bg-surface/95 px-6 py-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-ink">
                  Weekly hours
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Your recurring availability. Clients can only book inside these
                  hours, and the schedule repeats every week until you change it.
                </p>
              </div>
              {/* Was a white glyph on `bg-white/10`, sized for the teal band
                  this header used to be. Invisible now that the band is light. */}
              <SheetClose
                aria-label="Close"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              >
                <X aria-hidden="true" className="size-[18px]" />
              </SheetClose>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 py-5">
            {fields.map((dayField, dayIndex) => (
              <div
                key={dayField.id}
                className="surface-card p-4"
              >
                <div className="flex items-center gap-3">
                  <Controller
                    name={`availability.${dayIndex}.available`}
                    control={control}
                    render={({ field }) => (
                      /*
                        The switch had no accessible name — the day was in a
                        sibling `<div>`, not inside the label — and
                        `peer-focus:outline-none` removed the focus ring from an
                        `sr-only` input, so a keyboard user toggling days had no
                        indication of where they were. The day is now the label,
                        and focus is visible on the track.
                      */
                      <label className="flex cursor-pointer items-center gap-3">
                        <span className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:shadow-xs after:transition-transform after:duration-200 after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 peer-focus-visible:ring-offset-2" />
                        </span>

                        <span className="text-sm font-semibold text-ink">
                          {DAY_LABELS[dayField.day] ?? dayField.day}
                        </span>
                      </label>
                    )}
                  />

                  {!watch(`availability.${dayIndex}.available`) && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-inset ring-slate-200/70">
                      Not available
                    </span>
                  )}
                </div>
                {watch(`availability.${dayIndex}.available`) && (
                  <div className="mt-4 border-t border-hairline pt-4">
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

          <div className="sticky bottom-0 border-t border-hairline bg-surface/95 px-6 py-4 backdrop-blur-md">
            <Button type="submit" size="lg" fullWidth>
              Save weekly schedule
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AppointmentSettings;
