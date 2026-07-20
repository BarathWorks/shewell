"use client";

import { useState, useEffect } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Label } from "@repo/ui/src/@/components/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOTP, emailChange } from "./personal-info-actions";
import { Button } from "@repo/ui/src/@/components/button";
import { toast } from "@repo/ui/src/@/components/use-toast";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/src/@/components/input-otp";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

export type IEmailChangeForm = {
  otp: string;
  email: string;
};

const infoFormSchema = z.object({
  otp: z.string({ required_error: "Please enter the OTP" }).length(6, "OTP must be 6 digits"),
  email: z
    .string({ required_error: "Please enter the email" })
    .email({ message: "Enter a valid Email address" }),
});

interface EmailChangeFormProps {
  onSuccess?: () => void;
}

const EmailChangeForm = ({ onSuccess }: EmailChangeFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof infoFormSchema>>({
    resolver: zodResolver(infoFormSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      const resp = await emailChange();
      if (resp.error) {
        toast({
          title: resp.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your email address.",
        });
        setResendTimer(60);
      }
    } catch (err) {
      toast({
        title: "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: IEmailChangeForm) => {
    setIsSubmitting(true);
    try {
      const resp = await verifyOTP(data);
      if (resp?.message) {
        toast({
          title: "Success",
          description: resp.message,
        });
        if (onSuccess) onSuccess();
        router.refresh();
      } else if (resp?.error) {
        toast({
          title: "Verification Failed",
          description: resp.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error changing email",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col gap-2">
        <Label className="font-poppins text-sm font-medium text-[#333333]">
          New Email Address *
        </Label>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <>
              <UIFormInput
                type="email"
                placeholder="eg. newemail@example.com"
                value={field.value}
                onChange={field.onChange}
                className="rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-poppins text-sm font-medium text-[#333333]">
            Verify 6-Digit OTP *
          </Label>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || isResending}
            className="flex items-center gap-1 font-poppins text-xs font-medium text-[#00898F] hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {isResending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>

        <Controller
          control={control}
          name="otp"
          render={({ field }) => (
            <>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={field.value}
                onChange={field.onChange}
                className="flex justify-center gap-2"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="rounded-lg border-gray-200 bg-gray-50 font-poppins font-semibold" />
                  <InputOTPSlot index={1} className="rounded-lg border-gray-200 bg-gray-50 font-poppins font-semibold" />
                  <InputOTPSlot index={2} className="rounded-lg border-gray-200 bg-gray-50 font-poppins font-semibold" />
                  <InputOTPSlot index={3} className="rounded-lg border-gray-200 bg-gray-50 font-poppins font-semibold" />
                  <InputOTPSlot index={4} className="rounded-lg border-gray-200 bg-gray-50 font-poppins font-semibold" />
                  <InputOTPSlot index={5} className="rounded-lg border-gray-200 bg-gray-50 font-poppins font-semibold" />
                </InputOTPGroup>
              </InputOTP>
              {errors.otp && (
                <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>
              )}
            </>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#00898F] px-6 py-2.5 font-poppins text-sm font-semibold text-white shadow-md hover:bg-[#007277]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Update Email"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmailChangeForm;

