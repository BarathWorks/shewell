"use client";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormPasswordInput from "@repo/ui/src/@/components/form/password-input";
import { Button } from "@repo/ui/src/@/components/button";
// import RegisterUserAction from "./register-user-action";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import PersInfoUserAction from "./personal-info-user-action";
import { signIn, useSession } from "next-auth/react";
import { CustomisedCalendar } from "@repo/ui/src/@/components/customised-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/src/@/components/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/app/lib/utils";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
const zodValidation = z.object({
  firstName: z.string({ required_error: "Please enter the first name" }),
  lastName: z
    .string({ required_error: "Please enter the last name" })
    .optional(),
  dob: z.date({ required_error: "Please select the date" }),
  email: z
    .string({ required_error: "Please enter the email" })

    .email({ message: "Please enter a valid Email address" })
    .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
      message: "Invalid Email",
    }),
  password: z
    .string({ required_error: "Please enter the password" })

    .min(8, { message: "Password must have 8 characters" })
    .regex(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/i,
      ),
      {
        message:
          "Minimum eight and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character is required",
      },
    ),
  phoneNumber: z
    .string({ required_error: "Please enter the phone number" })
    .max(10, { message: "Phone Number can have maximum 10 digits" })
    .regex(new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/), {
      message: "Please enter the correct phone number",
    }),
  userName: z.string({ required_error: "Please enter the username" }),
});

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof zodValidation>>({
    resolver: zodResolver(zodValidation),
  });

  const { toast } = useToast();
  const router = useRouter();

  const [loadingState, setLoadingState] = useState<boolean>(false);
  // const [currentStep, setCurrentStep] = useState<number>(1)
  // const searchParams = useSearchParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  params.set("step", "2")

  // useEffect(() => {

  //   params.set("step", "1")
  //   window.history.pushState(null,"", `${pathname}?${params.toString()}` )
  // })
  // useEffect(() => {
  //   const step = parseInt(searchParams.get("currentStep") || "1", 10);
  //   setCurrentStep(step);
  // }, [searchParams]);

  const submitForm = async (data: z.infer<typeof zodValidation>) => {
    console.log("data", data);
    setLoadingState(true)
    

    PersInfoUserAction(data as {  firstName: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  password: string;
  dob: Date;
  userName: string;})
      .then(async (resp) => {
        setLoadingState(false);
        const loginResult = await signIn("CredentialsVyanDoctor", {
          redirect: false,
          email: data.email,
          password: data.password,
        });
        // if (!loginResult!.ok) {
        //   throw new Error("Failed to log in User");
        // }
        toast({
          description: "Successfull Registration",
          variant: "default",
        });
        console.log(resp?.message);

        router.push(`/auth/register/address-identity/?step=2`);
        
      })
      .catch((err) => {
       
        console.log(err);
        toast({
          description: err.message,
          variant: "destructive",
        });
      })
      .finally(() =>  {setLoadingState(false)})
  };

  const onError = (error: any) => {
    console.log(error);
  };
  // const { data: session } = useSession();
  // console.log("session", session);
  return (
    <>
      {/* <div className="mb-5  font-inter text-center text-[20px]	font-semibold leading-[32px] sm:text-[22px] md:mb-8  xl:mb-9 2xl:mb-[50px] 2xl:text-3xl">
        Create your free account
      </div> */}

      <form
        onSubmit={handleSubmit(submitForm, onError)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6 "
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
         <div className="flex flex-col gap-[18px] lg:flex-row lg:gap-5">
         <div className="w-full">
            <UIFormLabel>First Name*</UIFormLabel>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your first name"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                    {errors && errors.firstName && (
                      <p className="text-red-500">{errors.firstName.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="w-full">
            <UIFormLabel>Last Name</UIFormLabel>
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your Last Name"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                    {errors && errors.lastName && (
                      <p className="text-red-500">{errors.lastName.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>
         </div>

          <div>
            <UIFormLabel>User Name</UIFormLabel>
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

          <div className="flex flex-col gap-4 md:flex-row xl:gap-6 ">
            <div className="w-full">
              <UIFormLabel>Date of Birth</UIFormLabel>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full py-[24px] px-[12px] text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="center">
                          <CustomisedCalendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="w-full bg-white py-3"
                            disabled={(date: Date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            fromYear={1920}
                            toYear={new Date().getFullYear()}
                          />
                          {/* <DateTimePicker
                          //   mode="single"
                          // selected={field.value}
                          //   onSelect={field.onChange}
                          className="bg-white"
                          value={field.value}
                          onChange={field.onChange}
                          //   disabled={(date: Date) =>
                          //     date > new Date() || date < new Date("1900-01-01")
                          //   }
                          //   initialFocus
                          //   fromYear={1950}
                          //   toYear={2100}
                        /> */}
                        </PopoverContent>
                      </Popover>
                      {/* <UIFormInput
                      className="pr-3"
                        type="date"
                        placeholder="Enter your DOB"
                        value={field.value}
                        onChange={field.onChange}
                      /> */}
                      {errors && errors.dob && (
                        <p className="text-red-500">{errors.dob.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <UIFormLabel>Phone Number</UIFormLabel>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        type="tel"
                        placeholder="Enter your Phone Number"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {errors && errors.phoneNumber && (
                        <p className="text-red-500">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
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
      {/* <div className="mt-[45px] hidden md:block">
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
      </div> */}
    </>
  );
};

export default RegisterForm;
