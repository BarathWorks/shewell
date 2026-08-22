"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Plus, Trash2 } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Field, SelectInput, TextInput } from "~/components/ui/field";
import { Section } from "~/components/ui/page";
import { env } from "~/env";
import SetPriceUserAction from "./setPrices-user-action";

interface IPrices {
  time: number;
  priceInCentsForSingle: number;
  priceInCentsForCouple: number;
}

const DURATIONS = [30, 60, 90, 120] as const;

/**
 * Consultation durations and what each one costs.
 *
 * Notes on what changed beyond the layout:
 *
 *  - Add and remove were bare `<svg onClick>` elements. Not focusable, no
 *    accessible name, no `type="button"` — and inside a form, an unbuttoned
 *    clickable that is later made a button defaults to submit. They are real
 *    buttons with labels now.
 *  - Every row rendered the delete icon twice: once in the `index === length - 1`
 *    branch and once in the `else`. Two 30-line copies of the same path data for
 *    one control.
 *  - The submit button said "Update Profile" and then navigated to
 *    `/appointment` — a different section of the app entirely, with no
 *    indication that was about to happen. It stays put and confirms the save.
 *  - The platform-fee line was `text-primary text-xs` floating between the rows
 *    and the button, easy to miss. It is stated where the fee actually matters:
 *    next to the amounts, with the practitioner's take-home shown per row so the
 *    percentage does not have to be applied mentally.
 *  - Another mount effect writing an unread `?step=4` into history. Gone.
 */
const PricesForm = ({ prices }: { prices: IPrices[] | null }) => {
  const schema = z.object({
    sessions: z
      .array(
        z.object({
          time: z.number({ required_error: "Choose a duration" }),
          priceInCentsForSingle: z
            .number({ required_error: "Enter a fee" })
            .min(1, { message: "Enter a fee above zero" }),
          priceInCentsForCouple: z
            .number({ required_error: "Enter a fee" })
            .min(1, { message: "Enter a fee above zero" }),
        }),
      )
      .min(1, { message: "Offer at least one session length" }),
  });

  const updatedPrices =
    prices?.map((item) => ({
      ...item,
      priceInCentsForSingle: item.priceInCentsForSingle! / 100,
      priceInCentsForCouple: item.priceInCentsForCouple! / 100,
    })) ?? [];

  const defaultValues =
    updatedPrices.length > 0
      ? updatedPrices
      : [{ time: 30, priceInCentsForSingle: 0, priceInCentsForCouple: 0 }];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { sessions: defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  const { toast } = useToast();
  const router = useRouter();

  const platformFee = Number(env.NEXT_PUBLIC_PLATFORM_FEE) || 0;

  const takeHome = (amount: number) =>
    Number.isFinite(amount) && amount > 0
      ? Math.round(amount * (1 - platformFee / 100))
      : 0;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await SetPriceUserAction({ appointmentPrice: data.sessions as IPrices[] });
      toast({ description: "Consultation fees saved" });
      router.refresh();
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : "Couldn't save your fees. Try again.",
        variant: "destructive",
      });
    }
  };

  const sessions = watch("sessions");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Section
        title="Consultation fees"
        note={`Shewell's platform fee is ${platformFee}% of what you charge. The take-home figure under each amount already has it deducted.`}
        bodyClassName="p-0"
        footer={
          <Button type="submit" isLoading={isSubmitting} loadingText="Saving…">
            Save fees
          </Button>
        }
      >
        <ul className="divide-y divide-hairline">
          {fields.map((field, index) => (
            <li key={field.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="eyebrow">Session {index + 1}</p>

                {fields.length > 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    leadingIcon={Trash2}
                    onClick={() => remove(index)}
                    className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Controller
                  control={control}
                  name={`sessions.${index}.time`}
                  render={({ field: durationField }) => (
                    <Field
                      label="Duration"
                      htmlFor={`session-${index}-time`}
                      required
                      error={errors.sessions?.[index]?.time?.message}
                    >
                      <SelectInput
                        id={`session-${index}-time`}
                        value={String(durationField.value)}
                        onChange={(event) =>
                          durationField.onChange(Number(event.target.value))
                        }
                        invalid={Boolean(errors.sessions?.[index]?.time)}
                      >
                        {DURATIONS.map((minutes) => (
                          <option key={minutes} value={minutes}>
                            {minutes} minutes
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name={`sessions.${index}.priceInCentsForSingle`}
                  render={({ field: priceField }) => {
                    const net = takeHome(Number(sessions?.[index]?.priceInCentsForSingle));

                    return (
                      <Field
                        label="One-to-one fee"
                        htmlFor={`session-${index}-single`}
                        required
                        error={
                          errors.sessions?.[index]?.priceInCentsForSingle?.message
                        }
                        hint={net > 0 ? `You receive ₹${net.toLocaleString("en-IN")}` : undefined}
                      >
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                            ₹
                          </span>
                          <TextInput
                            {...priceField}
                            id={`session-${index}-single`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            className="pl-8"
                            placeholder="500"
                            value={priceField.value ?? ""}
                            onChange={(event) =>
                              priceField.onChange(
                                event.target.value === ""
                                  ? undefined
                                  : Number(event.target.value),
                              )
                            }
                            invalid={Boolean(
                              errors.sessions?.[index]?.priceInCentsForSingle,
                            )}
                          />
                        </div>
                      </Field>
                    );
                  }}
                />

                <Controller
                  control={control}
                  name={`sessions.${index}.priceInCentsForCouple`}
                  render={({ field: priceField }) => {
                    const net = takeHome(Number(sessions?.[index]?.priceInCentsForCouple));

                    return (
                      <Field
                        label="Couples fee"
                        htmlFor={`session-${index}-couple`}
                        required
                        error={
                          errors.sessions?.[index]?.priceInCentsForCouple?.message
                        }
                        hint={net > 0 ? `You receive ₹${net.toLocaleString("en-IN")}` : undefined}
                      >
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                            ₹
                          </span>
                          <TextInput
                            {...priceField}
                            id={`session-${index}-couple`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            className="pl-8"
                            placeholder="1000"
                            value={priceField.value ?? ""}
                            onChange={(event) =>
                              priceField.onChange(
                                event.target.value === ""
                                  ? undefined
                                  : Number(event.target.value),
                              )
                            }
                            invalid={Boolean(
                              errors.sessions?.[index]?.priceInCentsForCouple,
                            )}
                          />
                        </div>
                      </Field>
                    );
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline p-5">
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted">
            <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>
              Clients choose from these when booking. Offering more than one
              length gives them a shorter, cheaper way to start.
            </span>
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            leadingIcon={Plus}
            onClick={() =>
              append({
                time: 60,
                priceInCentsForSingle: 0,
                priceInCentsForCouple: 0,
              })
            }
          >
            Add a session length
          </Button>
        </div>
      </Section>
    </form>
  );
};

export default PricesForm;
