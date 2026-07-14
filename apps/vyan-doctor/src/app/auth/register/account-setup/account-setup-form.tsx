"use client";
import { useForm, Controller } from "react-hook-form";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormPasswordInput from "@repo/ui/src/@/components/form/password-input";
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

    AccountSetupUserAction(data as any)
      .then(async (resp: any) => {
        if (resp.success) {
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
        } else {
          setLoadingState(false);
          toast({
            description: resp.error,
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast({
          description: "Something went wrong. Please try again.",
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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Account Setup</h3>
      <form
        onSubmit={handleSubmit(submitForm, onError)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">User Name*</UIFormLabel>
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
                      value={field.value || ""}
                      onChange={field.onChange}
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
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter your password"
                      className="border-none bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
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

export default AccountSetupForm;
