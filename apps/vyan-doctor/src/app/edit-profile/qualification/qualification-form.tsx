"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { getYear } from "date-fns";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "~/components/ui/field";
import { Section } from "~/components/ui/page";
import EditQualificationUserAction, {
  IQualification,
} from "./qualification-user-action";

interface IDegree {
  degree: string;
}

interface IExperience {
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
}

const formSchema = z.object({
  experiences: z.array(
    z
      .object({
        startingYear: z
          .string({ required_error: "Choose a start year" })
          .min(4, { message: "Choose a start year" }),
        endingYear: z
          .string({ required_error: "Choose an end year" })
          .min(4, { message: "Choose an end year" }),
        position: z
          .string({ required_error: "Enter your role" })
          .min(1, { message: "Enter your role" }),
        department: z
          .string({ required_error: "Enter the department" })
          .min(1, { message: "Enter the department" }),
        location: z
          .string({ required_error: "Enter the hospital or clinic" })
          .min(1, { message: "Enter the hospital or clinic" }),
      })
      .refine(
        (data) => parseInt(data.startingYear) < parseInt(data.endingYear),
        {
          message: "The start year must be before the end year",
          path: ["startingYear"],
        },
      ),
  ),
  degrees: z.array(
    z.object({
      degree: z
        .string({ required_error: "Enter the qualification" })
        .min(1, { message: "Enter the qualification" }),
    }),
  ),
  education: z
    .string({
      required_error: "Write a short education summary",
      invalid_type_error: "Write a short education summary",
    })
    .min(1, { message: "Write a short education summary" }),
});

/**
 * Degrees, experience and an education summary.
 *
 * This file was 876 lines; most of it was not logic. Each of the two repeatable
 * sections carried the add and remove controls twice — once in the
 * `index === length - 1` branch and once in the `else` — and every one of those
 * four copies inlined a five-path `<svg>` at 36×36 with its own hard-coded
 * `#CA0000` and `#181818`. That is roughly 240 lines to render two buttons.
 *
 * Beyond the length:
 *
 *  - Those controls were `<svg onClick>`. Not focusable, no accessible name, and
 *    with no `type` attribute they would submit the form if they were ever made
 *    into buttons. They are labelled `<button type="button">` now, so the form
 *    can be filled in from the keyboard — which, for a form with two dynamic
 *    field arrays, matters.
 *  - The year selects listed every year from 1900, newest last, so choosing 2019
 *    meant scrolling past 119 options. They run newest-first and start at 1950.
 *  - `useEffect(() => { params.set("step","2"); router.replace(...) }, [])` on
 *    mount, plus `?step=3` written onto the next page. Nothing reads either.
 *  - `FormProvider` wrapped the form but no descendant called `useFormContext`.
 *  - `loadingState` again, replaced by the form's own `isSubmitting`.
 */
const QualificationForm = ({
  aboutEducation,
  degrees,
  experiences,
}: {
  aboutEducation: string;
  degrees: IDegree[];
  experiences: IExperience[];
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const currentYear = getYear(new Date());

  // Newest first: a practising clinician's most recent post is the one they are
  // most likely to be entering, and it was previously 70+ options down the list.
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, index) =>
    String(currentYear - index),
  );

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      education: aboutEducation,
      degrees: degrees.length > 0 ? degrees : [{ degree: "" }],
      experiences:
        experiences.length > 0
          ? experiences
          : [
              {
                startingYear: "",
                endingYear: "",
                department: "",
                location: "",
                position: "",
              },
            ],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experiences" });

  const {
    fields: degreeFields,
    append: appendDegree,
    remove: removeDegree,
  } = useFieldArray({ control, name: "degrees" });

  const submit = async (data: z.infer<typeof formSchema>) => {
    try {
      await EditQualificationUserAction(data as IQualification);
      toast({ description: "Qualifications saved" });
      router.push("/edit-profile/specialization");
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : "Couldn't save your qualifications. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Education                                                         */}
      {/* ---------------------------------------------------------------- */}
      <Section
        title="Education"
        note="A short summary of your training, in your own words. This appears in the About tab of your public profile."
      >
        <Controller
          control={control}
          name="education"
          render={({ field }) => (
            <Field
              label="Education summary"
              htmlFor="education"
              required
              error={errors.education?.message}
            >
              <TextArea
                {...field}
                id="education"
                rows={5}
                placeholder="MSc in Clinical Psychology from…, followed by supervised practice at…"
                invalid={Boolean(errors.education)}
              />
            </Field>
          )}
        />
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Degrees                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Section
        title="Qualifications"
        note="List each degree or certification separately. Clients see these alongside your name."
        bodyClassName="p-0"
      >
        <ul className="divide-y divide-hairline">
          {degreeFields.map((field, index) => (
            <li key={field.id} className="flex items-start gap-3 p-5">
              <Controller
                control={control}
                name={`degrees.${index}.degree`}
                render={({ field: degreeField }) => (
                  <Field
                    label={`Qualification ${index + 1}`}
                    htmlFor={`degree-${index}`}
                    required
                    error={errors.degrees?.[index]?.degree?.message}
                    className="min-w-0 flex-1"
                  >
                    <TextInput
                      {...degreeField}
                      id={`degree-${index}`}
                      placeholder="e.g. MSc Clinical Psychology"
                      invalid={Boolean(errors.degrees?.[index]?.degree)}
                    />
                  </Field>
                )}
              />

              {degreeFields.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeDegree(index)}
                  aria-label={`Remove qualification ${index + 1}`}
                  className="mt-[1.65rem] flex size-11 shrink-0 items-center justify-center rounded-lg border border-hairline-strong text-muted transition-colors duration-200 hover:border-danger-500 hover:bg-danger-50 hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                >
                  <Trash2 aria-hidden="true" className="size-[18px]" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="border-t border-hairline p-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leadingIcon={Plus}
            onClick={() => appendDegree({ degree: "" })}
          >
            Add a qualification
          </Button>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Experience                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Section
        title="Experience"
        note="Your practice history. Each entry shows as a role, a place and a span of years."
        bodyClassName="p-0"
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
        <ul className="divide-y divide-hairline">
          {experienceFields.map((field, index) => (
            <li key={field.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="eyebrow">Position {index + 1}</p>

                {experienceFields.length > 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    leadingIcon={Trash2}
                    onClick={() => removeExperience(index)}
                    className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name={`experiences.${index}.startingYear`}
                  render={({ field: yearField }) => (
                    <Field
                      label="From"
                      htmlFor={`exp-${index}-from`}
                      required
                      error={errors.experiences?.[index]?.startingYear?.message}
                    >
                      <SelectInput
                        {...yearField}
                        id={`exp-${index}-from`}
                        value={yearField.value || ""}
                        invalid={Boolean(
                          errors.experiences?.[index]?.startingYear,
                        )}
                      >
                        <option value="" disabled>
                          Year
                        </option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name={`experiences.${index}.endingYear`}
                  render={({ field: yearField }) => (
                    <Field
                      label="To"
                      htmlFor={`exp-${index}-to`}
                      required
                      error={errors.experiences?.[index]?.endingYear?.message}
                    >
                      <SelectInput
                        {...yearField}
                        id={`exp-${index}-to`}
                        value={yearField.value || ""}
                        invalid={Boolean(errors.experiences?.[index]?.endingYear)}
                      >
                        <option value="" disabled>
                          Year
                        </option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name={`experiences.${index}.position`}
                  render={({ field: positionField }) => (
                    <Field
                      label="Role"
                      htmlFor={`exp-${index}-position`}
                      required
                      error={errors.experiences?.[index]?.position?.message}
                    >
                      <TextInput
                        {...positionField}
                        id={`exp-${index}-position`}
                        placeholder="e.g. Consultant Psychologist"
                        invalid={Boolean(errors.experiences?.[index]?.position)}
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name={`experiences.${index}.department`}
                  render={({ field: departmentField }) => (
                    <Field
                      label="Department"
                      htmlFor={`exp-${index}-department`}
                      required
                      error={errors.experiences?.[index]?.department?.message}
                    >
                      <TextInput
                        {...departmentField}
                        id={`exp-${index}-department`}
                        placeholder="e.g. Maternal Mental Health"
                        invalid={Boolean(
                          errors.experiences?.[index]?.department,
                        )}
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name={`experiences.${index}.location`}
                  render={({ field: locationField }) => (
                    <Field
                      label="Hospital or clinic"
                      htmlFor={`exp-${index}-location`}
                      required
                      error={errors.experiences?.[index]?.location?.message}
                      className="sm:col-span-2"
                    >
                      <TextInput
                        {...locationField}
                        id={`exp-${index}-location`}
                        placeholder="e.g. Rainbow Children's Hospital, Bengaluru"
                        invalid={Boolean(errors.experiences?.[index]?.location)}
                      />
                    </Field>
                  )}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-hairline p-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leadingIcon={Plus}
            onClick={() =>
              appendExperience({
                startingYear: "",
                endingYear: "",
                department: "",
                location: "",
                position: "",
              })
            }
          >
            Add a position
          </Button>
        </div>
      </Section>
    </form>
  );
};

export default QualificationForm;
