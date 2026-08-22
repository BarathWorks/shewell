"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import Multiselect from "multiselect-react-dropdown";
import { AlertCircle, ArrowRight } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Section } from "~/components/ui/page";
import SpecializationUserAction from "./specialization-user-action";

interface ISpecialization {
  value: string;
  label: string;
}

interface ISpecializationForm {
  specializations: ISpecialization[];
}

const schema = z.object({
  specializations: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .nonempty("Choose at least one specialisation."),
});

/**
 * Which areas the practitioner treats.
 *
 * Three things this fixes beyond the styling:
 *
 *  - `loadingState` was declared, read by the submit button, and never set to
 *    `true` anywhere. The button therefore never showed a pending state and could
 *    be pressed repeatedly while the action was in flight, submitting the form
 *    several times. It uses the form's own `isSubmitting` now, which cannot fall
 *    out of sync with the request.
 *  - A `useEffect` on mount wrote `?step=3` into the URL with `router.replace`,
 *    and the submit handler wrote `?step=4` onto the *next* page. Nothing read
 *    either — the stepper that was supposed to compared the value as a string and
 *    now derives the current section from the pathname. Both are gone, along with
 *    the history entry the effect added on every visit.
 *  - The commented-out `react-tailwindcss-select` block — 40 lines of dead
 *    configuration for a component that was swapped out — and an unused
 *    `useState(null)` called `animal`.
 */
const SpecializationForm = ({
  preSpecialisations,
  specializations,
}: {
  preSpecialisations: ISpecialization[] | undefined;
  specializations: ISpecialization[];
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ISpecializationForm>({
    resolver: zodResolver(schema),
    defaultValues: { specializations: preSpecialisations },
  });

  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (data: { specializations: ISpecialization[] }) => {
    try {
      await SpecializationUserAction(data);
      toast({ description: "Specialisations saved" });
      router.push("/edit-profile/prices");
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : "Couldn't save your specialisations. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Section
        title="Specialisations"
        note="These decide which searches you appear in, so list every area you genuinely practise — but only those."
        footer={
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Saving…"
            trailingIcon={ArrowRight}
          >
            Save and continue
          </Button>
        }
      >
        <Controller
          control={control}
          name="specializations"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="specialisations"
                className="text-sm font-medium leading-none text-ink"
              >
                Your specialisations
                <span aria-hidden="true" className="ml-0.5 text-danger-500">
                  *
                </span>
              </label>

              <Multiselect
                id="specialisations"
                placeholder="Search and select…"
                options={specializations}
                selectedValues={field.value}
                onSelect={(selectedList) => field.onChange(selectedList)}
                onRemove={(selectedList) => field.onChange(selectedList)}
                displayValue="label"
                /*
                  The library styles itself inline, so its appearance has to be
                  set through these objects rather than classes — otherwise the
                  control keeps its own blue chips and 2px grey border and reads
                  as a foreign widget dropped into the page.
                */
                style={{
                  searchBox: {
                    border: `1px solid ${errors.specializations ? "#D14343" : "#C6D3DD"}`,
                    borderRadius: "0.5rem",
                    padding: "0.375rem 0.5rem",
                    minHeight: "2.75rem",
                    fontSize: "0.8125rem",
                  },
                  inputField: { margin: "0.25rem", fontSize: "0.8125rem" },
                  chips: {
                    background: "#EDF7F8",
                    color: "#0A5C61",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    padding: "0.25rem 0.5rem",
                  },
                  optionContainer: {
                    border: "1px solid #DFE7ED",
                    borderRadius: "0.5rem",
                    boxShadow:
                      "0 6px 16px -4px rgb(13 22 30 / 0.09), 0 2px 6px -2px rgb(13 22 30 / 0.05)",
                  },
                  option: { fontSize: "0.8125rem", color: "#3E5162" },
                }}
              />

              {errors.specializations ? (
                <p className="flex items-start gap-1.5 text-xs font-medium text-danger-600">
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-px size-3.5 shrink-0"
                  />
                  <span>{errors.specializations.message}</span>
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-muted">
                  Start typing to search. Select a chip&apos;s cross to remove it.
                </p>
              )}
            </div>
          )}
        />
      </Section>
    </form>
  );
};

export default SpecializationForm;
