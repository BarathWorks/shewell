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
import { Button } from "@repo/ui/src/@/components/button";
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
interface AddUnavailabilityProps {
  unavailableDays: IUnavailableDays[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddUnavailability = ({
  unavailableDays,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddUnavailabilityProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [internalClose, setInternalClose] = useState<boolean>(false);
  const close = controlledOpen !== undefined ? controlledOpen : internalClose;
  const setClose = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalClose;
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
          {controlledOpen === undefined && (
            <DialogTrigger className="rounded-xl bg-white/90 px-[18px] py-2.5 font-poppins text-sm font-semibold text-[#0E3A47] shadow-md transition-all duration-300 hover:bg-[#A5F3FC] hover:shadow-lg md:px-5 md:text-base">
              + Unavailability
            </DialogTrigger>
          )}
          <DialogContent className="flex flex-col gap-5 rounded-2xl border border-primary/20 bg-white p-0 py-5 shadow-xl xs:max-w-[300px] sm:max-w-[590px]">
            <form onSubmit={handleSubmit(onSubmit, errorHandler)}>
              <div>
                <Controller
                  control={control}
                  name="dates"
                  render={({ field }) => (

                    <DayPicker
                      mode="multiple"
                      disabled={[{ before: new Date() }]}
                      // disabled={isDateDisabled()}
                      selected={field.value || updatedUnavailableDays}
                      onSelect={(dates) => field.onChange(dates)}
                    />
                  )}
                />
              </div>
              <div>
                
              </div>
              <div className="flex justify-center gap-4 pt-5 px-4">
                <Button
                  type="button"
                  onClick={() => setClose(false)}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-poppins text-sm font-semibold text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="rounded-xl bg-primary px-6 py-2.5 font-poppins text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg"
                >
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AddUnavailability;
