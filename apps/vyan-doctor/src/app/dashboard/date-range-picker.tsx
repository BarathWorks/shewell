"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
// import { DateRange, DayPicker } from "react-day-picker";
import { cn } from "../lib/utils";
import { Button } from "@repo/ui/src/@/components/button";
import { Calendar } from "@repo/ui/src/@/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/src/@/components/popover";
type DateRange = {
  from : Date,
  to : Date
}
const DatePickerWithRange = ({
  selectedDates,
  sendDatesToDashboardContent,
}: {
  selectedDates: DateRange ;
  sendDatesToDashboardContent: (data: DateRange ) => void;
}) => {
  const dates = React.useMemo(() => selectedDates, [selectedDates]);
  const handleSetDate = (selectedDate: DateRange) => {
    sendDatesToDashboardContent(selectedDate);
    console.log("date", selectedDate);
  };

  return (
    <>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              // id="date"
              variant={"outline"}
              className={cn(
                "h-11 w-full justify-start gap-2 rounded-lg border-hairline-strong bg-surface px-3.5 text-sm font-medium text-ink shadow-xs hover:border-primary-400 hover:bg-primary-50 sm:w-auto",
                !dates && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4 shrink-0 text-primary-600" />
              {dates?.from ? (
                dates.to ? (
                  <>
                    {format(dates.from, "LLL dd, y")} -{" "}
                    {format(dates.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dates.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-xl border border-hairline bg-surface p-0 shadow-lg" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dates?.from}
              selected={dates}
              // onSelect={setDate}
              // @ts-ignore
              onSelect={handleSetDate}

              // numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default DatePickerWithRange;
