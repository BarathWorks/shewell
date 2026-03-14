"use client";
import { useForm, Controller } from "react-hook-form";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormPasswordInput from "@repo/ui/src/@/components/form/password-input";
import { Button } from "@repo/ui/src/@/components/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import AccountSetupUserAction from "./account-setup-user-action";
import { signIn } from "next-auth/react";
import { useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";

const zodValidation = z.object({
  userName: z.string({ required_error: "Please enter the username" }),
  email: z
    .string({ required_error: "Please enter the email" })
    .email({ message: "Please enter a valid Email address" })
    .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
      message: "Invalid Email",
    }),
  password: z
    .string({ required_error: "Please enter the password" })
    .min(8, { message: "Password must have 8 characters" })
    .max(30, { message: "Password can have maximum 30 characters" })
    .regex(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/i,
      ),
      {
        message:
          "Minimum eight and maximum 30 characters, at least one uppercase letter, one lowercase letter, one number and one special character is required",
      },
    ),
});

const AccountSetupForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof zodValidation>>({
    resolver: zodResolver(zodValidation),
  });

  const { toast } = useToast();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const submitForm = async (data: z.infer<typeof zodValidation>) => {
    setLoadingState(true);

    AccountSetupUserAction(data)
      .then(async () => {
        const loginResult = await signIn("CredentialsVyanDoctor", {
          redirect: false,
          email: data.email,
          password: data.password,
        });
        setLoadingState(false);
        toast({
          description: "Account created successfully",
          variant: "default",
        });
        router.push(`/auth/register/personal-info/?step=2`);
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: err.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoadingState(false);
      });
  };

  const onError = (error: any) => {
    console.log(error);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(submitForm, onError)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6 "
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
          <div>
            <UIFormLabel>User Name*</UIFormLabel>
            <Controller
              control={control}
              name="userName"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your User Name"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors && errors.userName && (
                      <p className="text-red-500">{errors.userName.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div>
            <UIFormLabel>Email*</UIFormLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="email"
                      {...field}
                      value={field.value}
                      placeholder="Enter your email id"
                    />
                    {errors && errors.email && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div>
            <UIFormLabel>Password*</UIFormLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <UIFormPasswordInput
                      {...field}
                      placeholder="Enter your password"
                    />
                    {errors && errors.password && (
                      <div className="text-red-500">
                        {errors.password.message}
                      </div>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:justify-between">
            <Button
              disabled={loadingState}
              className="w-[260px] xl:order-last xl:w-[164px]"
              variant="OTP"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : " Next"}
            </Button>
            <div className=" font-inter text-sm font-normal sm:text-base">
              Already have a account?{" "}
              <Link
                className="ml-3 font-poppins text-base  font-medium text-primary"
                href="/auth/login"
              >
                Login{" "}
                <svg
                  className="inline"
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
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AccountSetupForm;
