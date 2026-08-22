"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import { Calendar } from "@repo/ui/src/@/components/calendar";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { buttonClass } from "~/components/ui/button-styles";
import { CalendarOff } from "lucide-react";
import { z } from "zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SheetClose } from "@repo/ui/src/@/components/sheet";
import { useToast } from "@repo/ui/src/@/components/use-toast";

import React from "react";

import { DayPicker } from "react-day-picker";
import {
  eachDayOfInterval,
  endOfToday,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfToday,
} from "date-fns";
import AddUnavailabilityUserAction from "./add-unavailability-user-action";
import { api } from "~/trpc/react";
// import "react-day-picker/style.css";

interface IUnavailableDays {
  date: Date;
}
const AddUnavailability = ({
  unavailableDays,
}: {
  unavailableDays: IUnavailableDays[];
}) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [close, setClose] = useState<boolean>();
  const trpcContext = api.useUtils();
  const schema = z.object({
    dates: z.array(z.date({ required_error: "Please select a date" })),

  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    
  });
  
  const { toast } = useToast();
  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log("unAvailableDates", data.dates);
    const utcDates = data.dates.map((date) => {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
    });
    AddUnavailabilityUserAction(utcDates)
      .then((resp) => {
        console.log(resp?.message);
        toast({
          description: resp?.message,
          variant: "default",
        });
        trpcContext.invalidate();
        setClose(false);
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: err.message,
          variant: "destructive",
        });
      });
  };
  const errorHandler = (e: any) => {
    console.log("error", e);
  };
  const monthCaptionStyle = {
    backgroundColor: "#00898F",
  };

  const formattedUnavailableDays = unavailableDays.map((item) => item.date);

  const today = new Date();

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Check if the date is before today
    if (isBefore(date, today)) {
      return true;
    }

    
  };

  console.log("isDateDisabled", isDateDisabled(today));
  const updatedUnavailableDays = unavailableDays.map((item) => item.date);
  return (
    <>
      <div>
        <Dialog open={close} onOpenChange={setClose}>
          {/*
            Same problem as the availability trigger: `bg-white/90` was legible on
            the teal banner this used to live on and invisible on the page it
            lives on now. "+ Unavailability" also named a database column rather
            than an action.
          */}
          <DialogTrigger className={buttonClass({ variant: "outline", size: "md" })}>
            <CalendarOff aria-hidden="true" className="size-4 shrink-0" />
            Block days
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-xl border border-hairline bg-surface p-0 shadow-xl sm:max-w-[34rem]">
            {/*
              The dialog opened straight onto a bare month grid — no title, no
              explanation of what selecting a date would do, and a "Create"
              button that named nothing. A dialog that changes when clients can
              reach you needs to say so before it is confirmed.
            */}
            <form onSubmit={handleSubmit(onSubmit, errorHandler)}>
              <header className="border-b border-hairline p-5">
                <h2 className="text-lg font-semibold text-ink">Block days off</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Pick the dates you are not available. Existing bookings are
                  unaffected — this only stops new ones being made.
                </p>
              </header>

              <div className="flex justify-center p-4">
                <Controller
                  control={control}
                  name="dates"
                  render={({ field }) => (
                    <DayPicker
                      mode="multiple"
                      disabled={[{ before: new Date() }]}
                      selected={field.value || updatedUnavailableDays}
                      onSelect={(dates) => field.onChange(dates)}
                    />
                  )}
                />
              </div>

              <footer className="flex flex-col-reverse gap-2 border-t border-hairline bg-canvas p-4 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClose(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">Block these days</Button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AddUnavailability;
