"use client";
import UIFormInput from "./form/input";
import UIFormLabel from "./form/label";
import UIFormPasswordInput from "./form/password-input";
import { Controller, Form, useForm } from "react-hook-form";
import { Button } from "./button";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
type LoginCredentials = {
  email: string;
  password: string;
};
const Login = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  let errorMessage: string | undefined;
  if (error && error === "CredentialsSignin") {
    errorMessage = "Invalid email or password";
  }

  const loginHandler = async ({ email, password }: LoginCredentials) => {
    // "username-login" matches the id for the credential
    const signInData = await signIn("CrendentialsVyanClient", {
      email,
      password,
      redirect: false,
    });
    // .then((success) => {
    //   alert(JSON.stringify(success));
    //   if (success?.ok) {
    //     console.log("success", success);

    //     alert("login Successfully");
    //     router.replace("/");
    //   }
    // })
    // .catch((err) => {
    //   console.log(err);
    //   alert("something went wrong");
    // });
    if (signInData?.error) {
      console.log("SignINError", signInData.error);
    } else {
      router.push("/");
    }
  };

  const loginErrorHandler = (e: any) => {
    console.log("loginErrorHandler", e),
      (errorMessage = "Invalid Email or Password");
  };

  return (
    <>
      {errorMessage && (
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="mb-6 text-center font-inter text-2xl font-semibold md:mb-8 md:text-left xl:mb-9 2xl:mb-[50px] 2xl:text-3xl">
        Login into your account
      </div>
      <form
        className="rounded-md border-2 border-primary p-4 md:p-6"
        onSubmit={handleSubmit(loginHandler, loginErrorHandler)}
      >
        <div className="flex flex-col gap-6">
          <div>
            <UIFormLabel>Email*</UIFormLabel>
            <Controller
              name="email"
              control={control}
              rules={{
                required: { value: true, message: "Email is required." },
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email is invalid",
                },
              }}
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      type="email"
                      value={field.value}
                      onChange={field.onChange}
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
          <div className="">
            <UIFormLabel>Password*</UIFormLabel>
            <Controller
              name="password"
              control={control}
              rules={{
                required: { value: true, message: "Password is required." },
              }}
              render={({ field }) => {
                return (
                  <>
                    <UIFormPasswordInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter your password"
                    />
                    {errors && errors.password && (
                      <p className="text-red-500">{errors.password.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>
          <Button className="w-full md:w-[324px] mx-auto" variant="OTP" type="submit">
                  Login
                </Button>
          {/* <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="OTP" type="submit">
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <div className="flex flex-col items-center gap-6 px-[30px]">
                  <Button className="w-full" variant="OTP">
                    USER
                  </Button>
                  <Button className="w-full" variant="nonOTP">
                    PROFESSIONAL
                  </Button>
                </div>

                <DialogFooter>
                  <div className="mx-auto font-normal">
                    Already have a account?{" "}
                    <Link className="ml-4 font-medium text-primary" href="/auth/login">
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
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div> */}
          <div className="text-center font-inter text-base font-normal">
            Don't have Shewell account
            <Link
              className="ml-4 mt-2 block font-poppins text-base font-medium text-primary md:mt-0 md:inline"
              href="/auth/register"
            >
              Create account{" "}
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
      </form>
    </>
  );
};

export default Login;
