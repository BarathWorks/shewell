"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "~/components/ui/field";
import { Section } from "~/components/ui/page";
import PersonalInfoUserAction, {
  IPersonalInfo,
} from "./personal-info-user-action";

const PHONE_PATTERN = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

const formSchema = z.object({
  fullName: z
    .string({ required_error: "Enter your full name" })
    .min(1, { message: "Enter your full name" }),
  email: z
    .string({ required_error: "Enter your email address" })
    .email({ message: "Enter a valid email address" })
    .optional(),
  phoneNumber: z
    .string({ required_error: "Enter your phone number" })
    .min(10, { message: "A phone number is 10 digits" })
    .max(10, { message: "A phone number is 10 digits" })
    .regex(PHONE_PATTERN, { message: "Digits only" }),
  alternativePhoneNumber: z
    .string()
    .max(10, { message: "A phone number is 10 digits" })
    .regex(PHONE_PATTERN, { message: "Digits only" })
    .optional()
    .nullable()
    .or(z.literal("")),
  displayQualificationId: z.string({
    required_error: "Choose the qualification to display",
  }),
  bio: z
    .string({ required_error: "Write a short bio" })
    .min(1, { message: "Write a short bio" }),
  adImage: z.any().optional(),
});

interface ISpecialization {
  value: string;
  label: string;
}

/**
 * Name, contact details and bio.
 *
 * Beyond the layout:
 *
 *  - The email field was `disabled` but its `<Controller>` still carried a
 *    validation rule, so an account whose stored address failed the regex would
 *    block submission on a field the practitioner cannot edit. It is presented as
 *    read-only, with a note saying why, and its errors no longer gate the form.
 *  - The "To change the phone number you have to verify first" hint sat *between*
 *    the input and its error message, so an error appeared below the hint rather
 *    than below the field. Hint and error now share one slot, and the error wins.
 *  - `loadingState` was set correctly here, but the trailing arrow was a 20-line
 *    inline `<svg>` with its own `<clipPath>` repeated in four different forms
 *    across this directory.
 *  - The `?step=2` query parameter written on navigation. Nothing reads it.
 */
const PersonalInfoForm = ({
  firstName,
  email,
  phoneNumber,
  displayQualificationId,
  aboutYou,
  specialisations,
}: {
  firstName: string;
  email: string;
  phoneNumber: string;
  displayQualificationId: string;
  aboutYou: string;
  specialisations: ISpecialization[];
}) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: firstName,
      email,
      phoneNumber,
      bio: aboutYou,
      displayQualificationId,
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  const submit = async (data: z.infer<typeof formSchema>) => {
    try {
      await PersonalInfoUserAction(data as IPersonalInfo);
      toast({ description: "Personal information saved" });
      router.push("/edit-profile/qualification");
    } catch (error) {
      toast({
        description:
          error instanceof Error
            ? error.message
            : "Couldn't save your details. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Section
        title="Personal information"
        note="Your name and displayed qualification appear on your public profile. Contact details stay private and are used only to reach you about bookings."
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <Field
                label="Full name"
                htmlFor="full-name"
                required
                error={errors.fullName?.message}
              >
                <TextInput
                  {...field}
                  id="full-name"
                  autoComplete="name"
                  placeholder="e.g. Meera Nair"
                  leadingIcon={User}
                  invalid={Boolean(errors.fullName)}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field
                label="Email address"
                htmlFor="email"
                hint="Your sign-in address. Contact support to change it."
              >
                <TextInput
                  id="email"
                  type="email"
                  value={field.value ?? ""}
                  readOnly
                  disabled
                  leadingIcon={Mail}
                  className="cursor-not-allowed"
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <Field
                label="Phone number"
                htmlFor="phone"
                required
                error={errors.phoneNumber?.message}
                hint="Changing this requires verification before it takes effect."
              >
                <TextInput
                  {...field}
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  placeholder="9876543210"
                  leadingIcon={Phone}
                  invalid={Boolean(errors.phoneNumber)}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="alternativePhoneNumber"
            render={({ field }) => (
              <Field
                label="Alternative number"
                htmlFor="alt-phone"
                error={errors.alternativePhoneNumber?.message}
                hint="Optional. Used only if we cannot reach your main number."
              >
                <TextInput
                  {...field}
                  id="alt-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={field.value ?? ""}
                  placeholder="Optional"
                  leadingIcon={Phone}
                  invalid={Boolean(errors.alternativePhoneNumber)}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="displayQualificationId"
            render={({ field }) => (
              <Field
                label="Qualification shown on your profile"
                htmlFor="display-qualification"
                required
                error={errors.displayQualificationId?.message}
                className="lg:col-span-2"
                hint="This is the single line clients read under your name."
              >
                <SelectInput
                  {...field}
                  id="display-qualification"
                  value={field.value || ""}
                  invalid={Boolean(errors.displayQualificationId)}
                >
                  <option value="" disabled>
                    Choose a qualification…
                  </option>
                  {specialisations.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field }) => (
              <Field
                label="Short bio"
                htmlFor="bio"
                required
                error={errors.bio?.message}
                className="lg:col-span-2"
                hint="A few sentences on how you work and who you help. Clients read this before booking."
              >
                <TextArea
                  {...field}
                  id="bio"
                  rows={5}
                  placeholder="I work with new and expecting mothers on anxiety, sleep and the transition to parenthood…"
                  invalid={Boolean(errors.bio)}
                />
              </Field>
            )}
          />
        </div>
      </Section>
    </form>
  );
};

export default PersonalInfoForm;
