"use client";
import { Button } from "@repo/ui/src/@/components/button";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useSearchParams } from "next/navigation";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/src/@/components/input-otp";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import verifyOtpAction from "./verify-otp-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";

import resendOTP from "./resend-otp-action";
import React from "react";

const formSchema = z.object({
  otp: z
    .string({ required_error: "Please enter your otp" })
    .min(6, { message: "Please enter the 6 digit otp" }),
});

interface IFormSchema {
  otp: string;
}

const VerifyOTPForm = ({
  verifiedAt,
  email: emailProp,
}: {
  verifiedAt: Date | null;
  email?: string;
}) => {
  // const form = useForm<IFormSchema>();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { toast } = useToast();
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Resolve email from prop, search param, or session
  const email = emailProp || searchParams.get("email") || session.data?.user?.email;

  if (verifiedAt) {
    redirect("/");
  }

  // NOTE: Removed unauthenticated redirect to allow URL-based verification
  // if (session.status === "unauthenticated") {
  //   redirect("/auth/login");
  // }
  const [isVerifying, setIsVerifying] = React.useState(false);

  const onSubmit = async (data: IFormSchema) => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email not found. Please register again.",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const resp = await verifyOtpAction({ email, otp: data.otp });

      if (resp.status === "error") {
        toast({ variant: "destructive", title: resp.message });
        // The pending registration is gone; there is nothing left to verify.
        if (resp.code === "NOT_FOUND") router.push("/auth/register");
        return;
      }

      toast({ title: resp.message, variant: "default" });

      // Sign in with the single-use code the action just issued.
      //
      // This previously called the credentials provider with no password field at
      // all — which can never authenticate — and then pushed to `/` regardless, so
      // every new user landed on the home page signed out with no indication why.
      const signInResult = await signIn("OtpVyanClient", {
        redirect: false,
        email: resp.email,
        otp: resp.signInOtp,
      });

      if (!signInResult?.ok) {
        toast({
          title: "Account verified. Please log in to continue.",
          variant: "default",
        });
        router.push(`/auth/login?email=${encodeURIComponent(resp.email)}`);
        return;
      }

      await session.update();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err?.message || "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const [timer, setTimer] = React.useState(30);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOTP = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email not found. Please register again.",
      });
      return;
    }

    if (!canResend) return;
    setCanResend(false);
    setTimer(30);
    resendOTP(email)
      .then((resp) => {
        toast({
          title: resp.message,
          variant: resp.status === "sent" ? "default" : "destructive",
        });
        if (resp.status === "error" && resp.code === "NOT_FOUND") {
          router.push("/auth/register");
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to resend OTP. Please try again.",
        });
      });
  };
  const handleLogout = async () => {
    // Clear session and redirect to register
    await signOut({ callbackUrl: "/auth/register" });
  };

  return (
    <>
      <div className="mb-[50px] flex items-center justify-between">
        <Button
          onClick={() => router.back()}
          className="rounded-md bg-[#ECECEC80] p-[10px] text-black hover:bg-[#ECECEC80]"
        >
          <svg
            className="mr-1"
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 13L1 7L7 1"
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Button>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50"
        >
          Wrong Email? / Start Over
          <LogOut className="ml-2 w-4 h-4" />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center rounded-3xl border border-hairline bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:px-[50px] md:py-10 2xl:px-[97px]"
      >
        <div className="font-poppins text-xl font-semibold text-ink">
          Enter OTP*
        </div>

        {email && (
          <div className="mt-2 text-sm text-gray-500">
            Sent to {email}
          </div>
        )}
        <div className="my-6">
          <Controller
            control={control}
            name="otp"
            render={({ field }) => {
              return (
                <>
                  {" "}
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup className="mx-auto gap-2">
                      <InputOTPSlot
                        index={0}
                        className="rounded-lg border-hairline bg-gray-50 font-poppins text-lg transition-all focus:border-primary-600 focus:bg-white"
                      />
                      <InputOTPSlot
                        index={1}
                        className="rounded-lg border-hairline bg-gray-50 font-poppins text-lg transition-all focus:border-primary-600 focus:bg-white"
                      />
                      <InputOTPSlot
                        index={2}
                        className="rounded-lg border-hairline bg-gray-50 font-poppins text-lg transition-all focus:border-primary-600 focus:bg-white"
                      />
                      <InputOTPSlot
                        index={3}
                        className="rounded-lg border-hairline bg-gray-50 font-poppins text-lg transition-all focus:border-primary-600 focus:bg-white"
                      />
                      <InputOTPSlot
                        index={4}
                        className="rounded-lg border-hairline bg-gray-50 font-poppins text-lg transition-all focus:border-primary-600 focus:bg-white"
                      />
                      <InputOTPSlot
                        index={5}
                        className="rounded-lg border-hairline bg-gray-50 font-poppins text-lg transition-all focus:border-primary-600 focus:bg-white"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                  {errors && errors.otp && (
                    <p className="mt-2 text-center text-sm text-red-500">
                      {errors.otp.message}
                    </p>
                  )}
                </>
              );
            }}
          />
        </div>
        <div className="text-center">
          <button
            type="button"
            disabled={!canResend}
            className={`font-poppins text-sm font-medium ${canResend
              ? "cursor-pointer text-primary-700 hover:underline"
              : "cursor-not-allowed text-primary-700"
              }`}
            onClick={handleResendOTP}
          >
            {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
          </button>
        </div>

        <Button
          className="my-6 w-full rounded-xl py-6 font-poppins text-base font-semibold md:w-[324px]"
          variant="OTP"
          type="submit"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </form>
      <div className="mt-[45px] hidden md:block">
        <div className="mb-1 font-inter text-sm font-normal 2xl:text-base">
          By proceeding, you agree to the{" "}
          <Link
            href="#"
            className="font-inter text-sm font-normal text-primary 2xl:text-base"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="font-inter text-sm font-normal text-primary 2xl:text-base"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            className="font-inter text-sm font-normal 2xl:text-base"
            href={""}
          >
            Help
          </Link>
          <Link
            className="font-inter text-sm font-normal 2xl:text-base"
            href={""}
          >
            Privacy
          </Link>
          <Link
            className="font-inter text-sm font-normal 2xl:text-base"
            href={""}
          >
            Terms
          </Link>
        </div>
      </div>
    </>
  );
};
export default VerifyOTPForm;
