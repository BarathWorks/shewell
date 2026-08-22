"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, AtSign, Lock, Mail } from "lucide-react";

import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Button } from "~/components/ui/button";
import { Field, PasswordInput, TextInput } from "~/components/ui/field";
import AccountSetupUserAction from "./account-setup-user-action";

const zodValidation = z.object({
  // Mirrors the server rules in account-setup-user-action.ts. This was a bare
  // `z.string()`, so an empty or "!!!" username passed the form and was rejected
  // only after the round trip — and this value becomes a public profile URL.
  userName: z
    .string({ required_error: "Choose a username" })
    .trim()
    .min(3, { message: "At least 3 characters" })
    .max(40, { message: "40 characters or fewer" })
    .regex(/^[a-z0-9][a-z0-9._-]*$/i, {
      message: "Letters, numbers, dots, underscores and hyphens only",
    }),
  email: z
    .string({ required_error: "Enter your email address" })
    .email({ message: "Enter a valid email address" }),
  password: z
    .string({ required_error: "Choose a password" })
    .min(8, { message: "At least 8 characters" })
    .max(30, { message: "30 characters or fewer" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/,
      {
        message:
          "Include an uppercase letter, a lowercase letter, a number and a special character",
      },
    ),
});

/**
 * The first registration step.
 *
 * Behaviour is unchanged — same server action, same "no session until the email
 * is verified" rule, same redirect to `/auth/verify-email`.
 *
 * The password rule was previously enforced with the `i` flag on a regex whose
 * whole purpose is to require an uppercase *and* a lowercase letter. Case
 * insensitivity makes `(?=.*[a-z])` and `(?=.*[A-Z])` the same assertion, so
 * `password123!` satisfied both and the stated rule was never actually applied.
 * The flag is removed, which makes the message on screen true.
 *
 * Also: the requirement was stated only as a validation error *after* a rejected
 * attempt. It is a hint under the field now, so it can be met on the first try.
 */
const AccountSetupForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof zodValidation>>({
    resolver: zodResolver(zodValidation),
    defaultValues: { userName: "", email: "", password: "" },
  });

  const { toast } = useToast();
  const router = useRouter();

  const submitForm = async (data: z.infer<typeof zodValidation>) => {
    try {
      const response = await AccountSetupUserAction(data);

      if (!response.success) {
        toast({ description: response.error, variant: "destructive" });
        return;
      }

      toast({
        description: response.verificationSent
          ? "Account created. Check your email for a verification code."
          : "Account created, but we couldn't send your verification code — use “Resend code”.",
        variant: response.verificationSent ? "default" : "destructive",
      });

      // No sign-in here, deliberately.
      //
      // The rule this portal now follows is "no session until the address is
      // verified", and sign-in enforces it — so calling `signIn` at this point
      // would simply be refused. The practitioner verifies, signs in with the
      // password they just chose, and picks the wizard up from the dashboard,
      // which lists whatever is still outstanding.
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast({
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      noValidate
      className="surface-card flex flex-col gap-5 p-5 sm:p-6"
    >
      <Controller
        control={control}
        name="userName"
        render={({ field }) => (
          <Field
            label="Username"
            htmlFor="username"
            required
            error={errors.userName?.message}
            hint="This becomes your public profile address, so pick something you're happy for clients to see."
          >
            <TextInput
              {...field}
              id="username"
              autoComplete="username"
              placeholder="meera.nair"
              leadingIcon={AtSign}
              invalid={Boolean(errors.userName)}
            />
          </Field>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Field
            label="Email address"
            htmlFor="register-email"
            required
            error={errors.email?.message}
            hint="We send a verification code here before your account opens."
          >
            <TextInput
              {...field}
              id="register-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@practice.com"
              leadingIcon={Mail}
              invalid={Boolean(errors.email)}
            />
          </Field>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Field
            label="Password"
            htmlFor="register-password"
            required
            error={errors.password?.message}
            hint="8–30 characters, with an uppercase letter, a lowercase letter, a number and a special character."
          >
            <PasswordInput
              {...field}
              id="register-password"
              autoComplete="new-password"
              placeholder="Choose a strong password"
              leadingIcon={Lock}
              invalid={Boolean(errors.password)}
            />
          </Field>
        )}
      />

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted">
          Already registered?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary-700 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>

        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          loadingText="Creating account…"
          trailingIcon={ArrowRight}
          className="w-full sm:w-auto"
        >
          Create account
        </Button>
      </div>
    </form>
  );
};

export default AccountSetupForm;
