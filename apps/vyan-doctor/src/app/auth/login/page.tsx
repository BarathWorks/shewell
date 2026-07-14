"use client";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import UIFormPasswordInput from "@repo/ui/src/@/components/form/password-input";
import { Controller, Form, useForm } from "react-hook-form";
import { Button } from "@repo/ui/src/@/components/button";
import { signIn } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import * as z from "zod";
import { Toaster } from "@repo/ui/src/@/components/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import {
  ToastAction,
  ToastProvider,
  ToastViewport,
} from "@repo/ui/src/@/components/toast";
import { Toast } from "@repo/ui/src/@/components/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";
import { useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
import React from "react";
import { env } from "~/env";
// type LoginCredentials = {
//   email: string;
//   password: string;
// };

const zodValidation = z.object({
  email: z
    .string({ required_error: "Please enter the email address" })
    .email({ message: "Please enter a valid Email Address" })
    .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
      message: "Invalid Email",
    }),
  password: z
    .string({ required_error: "Please enter the password" })
    .min(8, { message: "Password must have 8 characters" }),
});

const Login = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof zodValidation>>({
    resolver: zodResolver(zodValidation),
  });
  const router = useRouter();
  const session = useSession();
  const { update } = session;
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const { toast } = useToast();

  if (session.status === "authenticated") {
    router.push("/dashboard");
  }
  const [loadingState, setLoadingState] = useState<boolean>(false);
  let errorMessage: string | undefined;
  if (error && error === "CredentialsSignin") {
    errorMessage = "Invalid email or password";
  }
 
  const USER =
  env.NEXT_PUBLIC_USER;
  const PROFESSIONAL =
    env.NEXT_PUBLIC_PROFESSIONAL 
  ;

  const loginHandler = async ({
    email,
    password,
  }: z.infer<typeof zodValidation>) => {
    setLoadingState(true);

    const lowerCaseEmail = email.toLowerCase();
    const signInData = await signIn("CredentialsVyanDoctor", {
      email: lowerCaseEmail,
      password,
      redirect: false,
    });
    setLoadingState(false);

    console.log("signInData", lowerCaseEmail, password);

    if (signInData?.error) {
      toast({
        title: "Failed to login",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login successful",
      });
      
      router.push("/dashboard");
    }
  };

  const loginErrorHandler = (e: any) => {
    console.log("loginErrorHandler", e),
      (errorMessage = "Invalid Email or Password");
  };

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  return (
    <>
      {errorMessage && (
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 mb-6"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Login into your account</h2>
      </header>

      <form
        className="space-y-6"
        onSubmit={handleSubmit(loginHandler, loginErrorHandler)}
        noValidate
      >
        <div className="flex flex-col gap-6">
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

          <button
            className="w-full bg-brand-teal text-white font-semibold py-3.5 rounded-lg transition-all shadow-sm active:scale-[0.99] hover:brightness-95 flex items-center justify-center gap-2"
            type="submit"
            disabled={loadingState}
          >
            {loadingState && <LoadingSpinner width="20" height="20" />}
            {loadingState ? "Loading..." : "Login"}
          </button>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-500">
              Don't have SheWellCare account?
              <Link href="/auth/register/account-setup" className="text-brand-teal font-bold ml-1 inline-flex items-center group">
                Create Account
                <svg className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;
