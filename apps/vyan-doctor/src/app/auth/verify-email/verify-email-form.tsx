"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/src/@/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/src/@/components/input-otp";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import LoadingSpinner from "~/app/components/loading-spinner";

import verifyEmailAction from "./verify-email-action";
import sendVerificationOtp from "./send-verification-otp-action";

const otpSchema = z.object({
  otp: z
    .string({ required_error: "Please enter the code" })
    .min(6, { message: "Please enter the 6-digit code" }),
});

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Practitioner email verification.
 *
 * Reached two ways, which is why the address arrives as a prop rather than from a
 * session: straight after signup, and from the login screen when an unverified
 * account tries to sign in. Neither has a session — this portal issues none until
 * the address is verified — so both end at the login screen.
 */
const VerifyEmailForm = ({ email }: { email: string }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) });

  const { toast } = useToast();
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  React.useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    setIsVerifying(true);
    try {
      const resp = await verifyEmailAction({ email, otp: data.otp });

      if (resp.status === "error") {
        toast({ description: resp.message, variant: "destructive" });
        // Already done — there is nothing to retry, so send them on.
        if (resp.code === "ALREADY_VERIFIED") {
          router.push("/auth/login");
        }
        if (resp.code === "NOT_FOUND") {
          router.push("/auth/register/account-setup");
        }
        return;
      }

      toast({ description: resp.message, variant: "default" });
      router.push(`/auth/login?verified=1&email=${encodeURIComponent(resp.email)}`);
    } catch (error) {
      toast({
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(RESEND_COOLDOWN_SECONDS);

    try {
      const resp = await sendVerificationOtp(email);
      toast({
        description: resp.message,
        variant: resp.status === "sent" ? "default" : "destructive",
      });
      if (resp.status === "error" && resp.code === "ALREADY_VERIFIED") {
        router.push("/auth/login");
      }
    } catch (error) {
      toast({
        description: "Failed to resend the code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mb-6 text-center font-inter text-2xl font-semibold md:mb-8 md:text-left xl:mb-9 2xl:mb-[50px] 2xl:text-3xl">
        Verify your email
      </div>

      <form
        className="surface-card p-5 sm:p-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-6">
          <p className="text-center font-inter text-sm text-gray-600">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to
            confirm this address belongs to you.
          </p>

          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <>
                <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                  <InputOTPGroup className="mx-auto gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {errors?.otp && (
                  <p className="mt-2 text-center text-sm text-red-500">
                    {errors.otp.message}
                  </p>
                )}
              </>
            )}
          />

          <button
            type="button"
            disabled={!canResend}
            onClick={handleResend}
            className={`font-inter text-sm font-medium ${
              canResend
                ? "cursor-pointer text-primary hover:underline"
                : "cursor-not-allowed text-gray-400"
            }`}
          >
            {canResend ? "Resend code" : `Resend code in ${timer}s`}
          </button>

          <Button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:w-auto"
            variant="OTP"
            type="submit"
            disabled={isVerifying}
          >
            {isVerifying && <LoadingSpinner width="20" height="20" />}
            {isVerifying ? "Verifying…" : "Verify"}
          </Button>

          <Link
            href="/auth/login"
            className="font-inter text-sm text-gray-500 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </>
  );
};

export default VerifyEmailForm;
