"use client";

import {
  UseFormSetValue,
  UseFormWatch,
  Control,
  useFieldArray,
  Controller,
  UseFormGetValues,
  FieldError,
} from "react-hook-form";
import { Time } from "@internationalized/date";
import { DateInput, DateSegment, TimeField } from "react-aria-components";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

import { IAvailability } from "~/models/availability.model";

interface IAvailabilityError {
  availability?: {
    [index: number]: {
      availableTimings?: {
        [slotIndex: number]: {
          startingTime?: FieldError;
          endingTime?: FieldError;
        };
      };
    };
  };
}

/**
 * The time ranges within one day of the weekly template.
 *
 * As with the other repeatable sections in this app, add and remove were bare
 * `<svg onClick>` elements — unfocusable, unlabelled, and duplicated across an
 * `index === length - 1` branch and its `else`, so one delete control was written
 * out twice at 30 lines each. They are labelled buttons now, written once.
 *
 * The time fields themselves were `<DateInput className="flex rounded-[6px]
 * border px-4 py-2">` — a 1px border in the browser default colour, and no focus
 * treatment at all, on a control made of individually focusable segments. They
 * now match the app's inputs, and the focused segment is visibly highlighted,
 * which is the only way to tell which part of the time you are editing.
 */
const AvailabilityTimings = ({
  index,
  control,
  setValue,
  getValues,
  errors,
}: {
  watch: UseFormWatch<IAvailability>;
  index: number;
  control: Control<IAvailability>;
  setValue: UseFormSetValue<IAvailability>;
  getValues: UseFormGetValues<IAvailability>;
  errors?: IAvailabilityError;
}) => {
  const { fields } = useFieldArray({
    control,
    name: `availability.${index}.availableTimings`,
  });

  const addTiming = (dayIndex: number) => {
    const updatedAvailability = getValues("availability");
    updatedAvailability[dayIndex]?.availableTimings.push({
      startingTime: new Time(15, 0),
      endingTime: new Time(16, 0),
    });
    setValue("availability", updatedAvailability);
  };

  const removeTiming = (dayIndex: number, slotIndex: number) => {
    const updatedAvailability = getValues("availability");
    updatedAvailability[dayIndex]?.availableTimings.splice(slotIndex, 1);
    setValue("availability", updatedAvailability);
  };

  const segmentClass =
    "rounded px-0.5 tabular text-sm text-ink outline-none focus:bg-primary-600 focus:text-white data-[placeholder]:text-muted";

  const inputClass =
    "flex h-11 items-center rounded-lg border border-hairline-strong bg-surface px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-primary-500 focus-within:shadow-focus";

  return (
    <div className="flex flex-col gap-2.5">
      {fields.map((field, slotIndex) => {
        const slotError =
          errors?.availability?.[index]?.availableTimings?.[slotIndex]
            ?.startingTime;
        const isLast = slotIndex + 1 === fields.length;

        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Controller
                name={`availability.${index}.availableTimings.${slotIndex}.startingTime`}
                control={control}
                render={({ field: startField }) => (
                  <TimeField
                    aria-label={`Slot ${slotIndex + 1} start time`}
                    hourCycle={12}
                    value={new Time(startField.value?.hour, startField.value?.minute)}
                    onChange={startField.onChange}
                  >
                    <DateInput className={inputClass}>
                      {(segment) => (
                        <DateSegment segment={segment} className={segmentClass} />
                      )}
                    </DateInput>
                  </TimeField>
                )}
              />

              <span aria-hidden="true" className="text-sm text-muted">
                to
              </span>

              <Controller
                name={`availability.${index}.availableTimings.${slotIndex}.endingTime`}
                control={control}
                render={({ field: endField }) => (
                  <TimeField
                    aria-label={`Slot ${slotIndex + 1} end time`}
                    hourCycle={12}
                    value={new Time(endField.value?.hour, endField.value?.minute)}
                    onChange={endField.onChange}
                  >
                    <DateInput className={inputClass}>
                      {(segment) => (
                        <DateSegment segment={segment} className={segmentClass} />
                      )}
                    </DateInput>
                  </TimeField>
                )}
              />

              <div className="ml-auto flex items-center gap-1.5">
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeTiming(index, slotIndex)}
                    aria-label={`Remove slot ${slotIndex + 1}`}
                    className="flex size-9 items-center justify-center rounded-lg border border-hairline-strong text-muted transition-colors duration-200 hover:border-danger-500 hover:bg-danger-50 hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                ) : null}

                {isLast ? (
                  <button
                    type="button"
                    onClick={() => addTiming(index)}
                    aria-label="Add another slot to this day"
                    className="flex size-9 items-center justify-center rounded-lg border border-hairline-strong text-body transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {slotError ? (
              <p className="flex items-start gap-1.5 text-xs font-medium text-danger-600">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-px size-3.5 shrink-0"
                />
                <span>The start time must be before the end time.</span>
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityTimings;
