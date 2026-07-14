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
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Create your free account</h3>
      <form
        onSubmit={handleSubmit(submitForm, onError)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-5">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">First Name*</UIFormLabel>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        type="text"
                        placeholder="Enter your first name"
                        value={field.value || ""}
                        onChange={field.onChange}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Last Name</UIFormLabel>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        type="text"
                        placeholder="Enter your Last Name"
                        value={field.value || ""}
                        onChange={field.onChange}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">User Name</UIFormLabel>
            <Controller
              control={control}
              name="userName"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your User Name"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.userName && (
                      <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-6 md:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Date of Birth</UIFormLabel>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-full py-3.5 px-4 text-left font-sans text-sm font-normal rounded-lg bg-[#f1f5f9] text-slate-900 focus:bg-[#e2e8f0] focus:outline-none focus:outline-2 focus:outline-brand-teal flex items-center justify-between",
                              !field.value && "text-slate-400",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-50 text-slate-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 animate-in fade-in-50 duration-200 z-[100]" align="center">
                          <CustomisedCalendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setIsCalendarOpen(false);
                            }}
                            className="bg-white py-3 shadow-md rounded-lg"
                            disabled={(date: Date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            fromYear={1920}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors && errors.dob && (
                        <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Phone Number</UIFormLabel>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        type="tel"
                        placeholder="Enter your Phone Number"
                        value={field.value || ""}
                        onChange={field.onChange}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">
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
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Email*</UIFormLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="email"
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter your email id"
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Password*</UIFormLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <UIFormPasswordInput
                      {...field}
                      placeholder="Enter your password"
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.password && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </div>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
            <p className="text-sm text-slate-500 font-sans">
              Already have an account?{" "}
              <Link
                className="text-brand-teal font-semibold hover:underline inline-flex items-center gap-1"
                href="/auth/login"
              >
                Login{" "}
                <svg className="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </p>
            <button
              disabled={loadingState}
              className="bg-brand-teal text-white font-bold py-3.5 px-8 rounded-lg transition-all shadow-sm active:scale-[0.99] hover:brightness-95 flex items-center justify-center gap-2 w-full sm:w-[160px]"
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : "Next"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
