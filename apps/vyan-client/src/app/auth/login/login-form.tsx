"use client";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import UIFormPasswordInput from "@repo/ui/src/@/components/form/password-input";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@repo/ui/src/@/components/button";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/src/@/components/input-otp";
import { useState } from "react";
import React from "react";

import sendLoginOtp from "./send-login-otp-action";
import verifyLoginOtp from "./verify-login-otp-action";

// ─── Step 1: Email validation ───
const emailSchema = z.object({
  email: z
    .string({ required_error: "Please enter the email address" })
    .email({ message: "Please enter a valid Email Address" })
    .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
      message: "Invalid Email",
    }),
});

// ─── Step 2 (OTP): OTP validation ───
const otpSchema = z.object({
  otp: z
    .string({ required_error: "Please enter the OTP" })
    .min(6, { message: "Please enter the 6-digit OTP" }),
});

// ─── Step 2 (Password): Password validation ───
const passwordSchema = z.object({
  password: z
    .string({ required_error: "Please enter the password" })
    .min(8, { message: "Password must have 8 characters" }),
});

type LoginStep = "email" | "otp" | "password";

const LoginForm = () => {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const session = useSession();
  const { update } = session;
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const { toast } = useToast();

  let errorMessage: string | undefined;
  if (error && error === "CredentialsSignin") {
    errorMessage = "Invalid email or password";
  }

  // ─── Email form ───
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  // ─── OTP form ───
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  });

  // ─── Password form ───
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  // ─── Resend OTP timer ───
  const [timer, setTimer] = React.useState(30);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    if (step !== "otp") return;
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // ─── Step 1: Submit email → send OTP ───
  const handleEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const resp = await sendLoginOtp(data.email);
      toast({
        title: resp?.message || "OTP sent to your email",
        variant: "default",
      });
      setEmail(data.email);
      setStep("otp");
      setTimer(30);
      setCanResend(false);
    } catch (err: any) {
      toast({
        title: err.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2 (OTP): Submit OTP → sign in ───
  const handleOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
      // First verify the OTP via server action
      await verifyLoginOtp({ email, otp: data.otp });

      // Then sign in via NextAuth OTP provider
      const signInData = await signIn("OtpVyanClient", {
        email,
        otp: data.otp,
        redirect: false,
      });

      if (signInData?.ok) {
        toast({
          title: "Login successful",
          variant: "default",
        });
        update().then(() => {
          router.push("/");
        });
      } else {
        toast({
          title: signInData?.error || "Login failed",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: err.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2 (Password): Submit password → sign in ───
  const handlePasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      const signInData = await signIn("CrendentialsVyanClient", {
        email,
        password: data.password,
        redirect: false,
      });

      if (signInData?.ok) {
        toast({
          title: "Login successful",
          variant: "default",
        });
        update().then(() => {
          router.push("/");
        });
      } else {
        toast({
          title: signInData?.error || "Invalid password",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: err.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP handler ───
  const handleResendOTP = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(30);
    try {
      const resp = await sendLoginOtp(email);
      toast({
        title: resp?.message || "OTP resent",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: err.message || "Failed to resend OTP",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full flex-col justify-center">
      {errorMessage && (
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="mb-6 text-center font-poppins text-2xl font-semibold text-[#333333] md:mb-8 md:text-left xl:mb-9 2xl:mb-[50px] 2xl:text-3xl">
        Login into your account
      </div>

      {/* ═══════════ STEP 1: EMAIL ═══════════ */}
      {step === "email" && (
        <form
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-10"
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
        >
          <div className="flex flex-col gap-6">
            <div>
              <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
                Email*
              </UIFormLabel>
              <Controller
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="email"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter your email id"
                      className="rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
                    />
                    {emailForm.formState.errors?.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <Button
              className="mx-auto w-full rounded-xl py-6 font-poppins text-base font-semibold md:w-[324px]"
              variant="OTP"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Continue"}
            </Button>

            <div className="text-center font-inter text-base font-normal text-[#666666]">
              Don't have SheWellCare account
              <Link href="/auth/register">
                <div className="ml-2 mt-2 block cursor-pointer font-poppins text-base font-medium text-[#00898F] hover:underline md:mt-0 md:inline">
                  Create Account
                  <svg
                    className="ml-1 inline"
                    width="15"
                    height="8"
                    viewBox="0 0 15 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.13634 3.36357L12.3273 3.36357L10.2318 1.26807C9.98332 1.01959 9.98332 0.616643 10.2318 0.368122C10.4803 0.119643 10.8833 0.119643 11.1318 0.368122L14.3136 3.54994C14.5621 3.79842 14.5621 4.20136 14.3136 4.44989L11.1318 7.6317C11.0075 7.75596 10.8447 7.81812 10.6818 7.81812C10.5189 7.81812 10.3561 7.75596 10.2318 7.6317C9.98332 7.38322 9.98332 6.98028 10.2318 6.73176L12.3273 4.6363L1.13634 4.6363C0.7849 4.6363 0.499979 4.35138 0.499979 3.99993C0.499979 3.64849 0.7849 3.36357 1.13634 3.36357Z"
                      fill="#00898F"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </form>
      )}

      {/* ═══════════ STEP 2: OTP ═══════════ */}
      {step === "otp" && (
        <form
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-10"
          onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="font-poppins text-xl font-semibold text-[#333333]">
              Enter OTP
            </div>
            <div className="text-sm text-gray-500">Sent to {email}</div>

            <div>
              <Controller
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup className="mx-auto gap-2">
                        <InputOTPSlot
                          index={0}
                          className="rounded-lg border-gray-200 bg-gray-50 font-poppins text-lg transition-all focus:border-[#00898F] focus:bg-white"
                        />
                        <InputOTPSlot
                          index={1}
                          className="rounded-lg border-gray-200 bg-gray-50 font-poppins text-lg transition-all focus:border-[#00898F] focus:bg-white"
                        />
                        <InputOTPSlot
                          index={2}
                          className="rounded-lg border-gray-200 bg-gray-50 font-poppins text-lg transition-all focus:border-[#00898F] focus:bg-white"
                        />
                        <InputOTPSlot
                          index={3}
                          className="rounded-lg border-gray-200 bg-gray-50 font-poppins text-lg transition-all focus:border-[#00898F] focus:bg-white"
                        />
                        <InputOTPSlot
                          index={4}
                          className="rounded-lg border-gray-200 bg-gray-50 font-poppins text-lg transition-all focus:border-[#00898F] focus:bg-white"
                        />
                        <InputOTPSlot
                          index={5}
                          className="rounded-lg border-gray-200 bg-gray-50 font-poppins text-lg transition-all focus:border-[#00898F] focus:bg-white"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                    {otpForm.formState.errors?.otp && (
                      <p className="mt-2 text-center text-sm text-red-500">
                        {otpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                disabled={!canResend}
                className={`font-poppins text-sm font-medium ${
                  canResend
                    ? "cursor-pointer text-[#00898F] hover:underline"
                    : "cursor-not-allowed text-[#00898F]"
                }`}
                onClick={handleResendOTP}
              >
                {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
              </button>
            </div>

            {/* Use password instead */}
            <button
              type="button"
              className="font-poppins text-sm font-medium text-[#00898F] hover:underline"
              onClick={() => setStep("password")}
            >
              Use password instead
            </button>

            <Button
              className="w-full rounded-xl py-6 font-poppins text-base font-semibold md:w-[324px]"
              variant="OTP"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Login"}
            </Button>

            {/* Back to email step */}
            <button
              type="button"
              className="font-inter text-sm text-[#666666] hover:underline"
              onClick={() => {
                setStep("email");
                otpForm.reset();
              }}
            >
              ← Change email
            </button>
          </div>
        </form>
      )}

      {/* ═══════════ STEP 2: PASSWORD ═══════════ */}
      {step === "password" && (
        <form
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-10"
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
        >
          <div className="flex flex-col gap-6">
            <div className="text-center font-poppins text-xl font-semibold text-[#333333]">
              Enter Password
            </div>
            <div className="text-center text-sm text-gray-500">
              Logging in as {email}
            </div>

            <div>
              <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
                Password*
              </UIFormLabel>
              <Controller
                name="password"
                control={passwordForm.control}
                render={({ field }) => (
                  <>
                    <UIFormPasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter your password"
                      className="rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
                    />
                    {passwordForm.formState.errors?.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Use OTP instead */}
            <button
              type="button"
              className="text-center font-poppins text-sm font-medium text-[#00898F] hover:underline"
              onClick={() => setStep("otp")}
            >
              Use OTP instead
            </button>

            <Button
              className="mx-auto w-full rounded-xl py-6 font-poppins text-base font-semibold md:w-[324px]"
              variant="OTP"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Back to email step */}
            <button
              type="button"
              className="text-center font-inter text-sm text-[#666666] hover:underline"
              onClick={() => {
                setStep("email");
                passwordForm.reset();
              }}
            >
              ← Change email
            </button>
          </div>
        </form>
      )}

      <div className="mt-[45px] hidden md:block">
        <div className="mb-1 font-inter text-sm font-normal 2xl:text-base">
          By proceeding, you agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-inter text-sm font-normal text-primary 2xl:text-base"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/"
            target="_blank"
            className="font-inter text-sm font-normal text-primary 2xl:text-base"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
