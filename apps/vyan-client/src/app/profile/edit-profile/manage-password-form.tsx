"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/@/components/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import UpdatePassword from "./password-actions";
import { signOut } from "next-auth/react";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import UIFormPasswordInput from "@repo/ui/src/@/components/form/password-input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import forgetPasswordAction from "~/app/auth/forgot-password/forget-password-action";
import { Loader2, ShieldAlert, CheckCircle } from "lucide-react";

const passwordFormSchema = z
  .object({
    password: z
      .string({ required_error: "Please enter your current password" })
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string({ required_error: "Please enter your new password" })
      .min(8, { message: "New password must be at least 8 characters long" })
      .regex(
        new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/i),
        {
          message:
            "Must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
        }
      ),
    confirmPassword: z.string({
      required_error: "Please retype your new password",
    }),
  })
  .refine((data) => data.password !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type IManagePassword = {
  email: string;
};

const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[@$!%*?&]/.test(pass)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-amber-500" };
  return { score: 3, label: "Strong", color: "bg-emerald-500" };
};

const ManagePasswordForm = ({ email }: IManagePassword) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchNewPassword = watch("newPassword", "");
  const passwordStrength = getPasswordStrength(watchNewPassword);

  const handleForgotPassword = async () => {
    try {
      const resp = await forgetPasswordAction({ email });
      toast({
        title: "Password Reset Email Sent",
        description: resp?.message || "Please check your inbox for instructions.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to send reset link",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const submitPassword = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsSubmitting(true);
    setOauthError(null);
    try {
      const resp = await UpdatePassword(data.password, data.newPassword);
      if (resp?.error) {
        if (resp.error.includes("third-party providers")) {
          setOauthError(resp.error);
        } else {
          toast({
            title: "Update Failed",
            description: resp.error,
            variant: "destructive",
          });
        }
      } else if (resp?.message) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully. Signing out...",
        });
        signOut({ callbackUrl: "/" });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-6 font-inter">
      {oauthError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="text-xs sm:text-sm font-inter">
            <p className="font-semibold font-poppins">OAuth Account Notice</p>
            <p className="mt-0.5 text-amber-700">{oauthError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(submitPassword)}>
        <div className="flex flex-col gap-6">
          <div className="text-sm text-[#666666]">
            Ensure your account is using a long and random password to stay secure.
          </div>

          {/* Current Password Field */}
          <div className="w-full">
            <div className="flex items-center justify-between">
              <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
                Current Password *
              </UIFormLabel>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-poppins text-xs font-medium text-[#00898F] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormPasswordInput
                    placeholder="Enter your current password"
                    value={field.value}
                    onChange={field.onChange}
                    className="mt-1.5 rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* New Password Field */}
          <div className="w-full">
            <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
              New Password *
            </UIFormLabel>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormPasswordInput
                    placeholder="Enter your new password"
                    value={field.value}
                    onChange={field.onChange}
                    className="mt-1.5 rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
                  />
                  {/* Password Strength Bar */}
                  {watchNewPassword && (
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-inter">
                        <span className="text-[#666666]">Password Strength:</span>
                        <span className="font-semibold text-gray-700">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width:
                              passwordStrength.score === 1
                                ? "33%"
                                : passwordStrength.score === 2
                                ? "66%"
                                : "100%",
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {errors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Confirm New Password Field */}
          <div className="w-full">
            <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
              Confirm New Password *
            </UIFormLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormPasswordInput
                    placeholder="Retype your new password"
                    value={field.value}
                    onChange={field.onChange}
                    className="mt-1.5 rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-start">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#00898F] px-8 py-3.5 font-poppins text-base font-semibold text-white shadow-[0_4px_14px_rgba(0,137,143,0.3)] transition-all hover:bg-[#007277] hover:shadow-[0_6px_20px_rgba(0,137,143,0.4)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Save Password"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManagePasswordForm;

