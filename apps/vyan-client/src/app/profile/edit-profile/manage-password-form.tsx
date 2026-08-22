"use client";
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
const passwordFormSchema = z
  .object({
    password: z
      .string({ required_error: "Please enter the password" })
      .min(8, { message: "Password can be of minimum 8 charcters" }),
    newPassword: z
      .string({ required_error: "Please enter the new password" })
      .min(8, { message: "New password must have 8 characters" })
      .regex(
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/i,
        ),
        {
          message:
            "Minimum eight and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character is required",
        },
      ),

    confirmPassword: z.string({
      required_error: "Please retype new password",
    }),
  })
  .refine((data) => data.password !== data.newPassword, {
    message: "New password must be different from the old password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"],
  });
type IManagePassword = {
  email: string;
};
const ManagePasswordForm = ({ email }: IManagePassword) => {
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
  });
  const callServerAction = (oldPass: string, newPass: string) => {
    return UpdatePassword(oldPass, newPass);
  };
  const submitPassword = (data: z.infer<typeof passwordFormSchema>) => {
    return callServerAction(data.password, data.newPassword)
      .then((resp) => {
        if (resp?.error) {
          toast({
            title: resp?.error,
            variant: "destructive",
          });
          console.log(resp.error);
        }
        if (resp?.message) {
          toast({
            title: resp.message,
          });
          signOut({ callbackUrl: "/" });
        }
      })
      .catch((err) => {
        toast({
          title: err,
          variant: "destructive",
        });
        console.log(err);
      })
      .finally(() => {});
  };
  return (
    <>
      <form onSubmit={handleSubmit(submitPassword)}>
        <div className="flex flex-col border-t border-t-gray-100 pt-10 font-inter md:flex-row">
          <div className="flex w-full flex-col gap-6 md:w-10/12 xl:gap-8">
            <div className="text-center font-inter text-sm font-normal text-muted">
              Strong passwords are essential for security. This subheading will
              show you how to create a new one.
            </div>
            <div className="flex flex-col gap-6">
              <div className="w-full">
                <div className="flex justify-between">
                  <UIFormLabel className="font-poppins text-sm font-medium text-ink">
                    Current Password*
                  </UIFormLabel>
                  <div
                    className="cursor-pointer font-poppins text-sm font-medium text-primary-700 underline"
                    onClick={() =>
                      forgetPasswordAction({ email })
                        .then((resp) => {
                          toast({
                            title: resp.message,
                          });
                        })
                        .catch((err) => {
                          toast({
                            title: err,
                            variant: "destructive",
                          });
                        })
                    }
                  >
                    Forgot Password?
                  </div>
                </div>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormPasswordInput
                          placeholder="Enter your current password"
                          value={field.value}
                          onChange={field.onChange}
                          className="rounded-xl border-hairline bg-gray-50 font-inter focus:border-primary-600 focus:bg-white"
                          // disabled={accountType === 'google'}
                        />
                        {errors && errors.password && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.password.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>
              <div className="w-full">
                <UIFormLabel className="font-poppins text-sm font-medium text-ink">
                  New Password*
                </UIFormLabel>
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormPasswordInput
                          placeholder="Enter your new password"
                          value={field.value}
                          onChange={field.onChange}
                          className="rounded-xl border-hairline bg-gray-50 font-inter focus:border-primary-600 focus:bg-white"
                          // disabled={accountType === 'google'}
                        />
                        {errors && errors.newPassword && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>
              <div className="w-full">
                <UIFormLabel className="font-poppins text-sm font-medium text-ink">
                  Retype Password*
                </UIFormLabel>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormPasswordInput
                          placeholder="Retype your new password"
                          value={field.value}
                          onChange={field.onChange}
                          className="rounded-xl border-hairline bg-gray-50 font-inter focus:border-primary-600 focus:bg-white"
                          // disabled={accountType === 'google'}
                        />
                        {errors && errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="mx-auto w-fit rounded-xl px-[49px] py-6 font-poppins text-base font-semibold shadow-[0_4px_14px_rgba(0,137,143,0.3)] hover:shadow-[0_6px_20px_rgba(0,137,143,0.4)]"
              variant="default"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ManagePasswordForm;
