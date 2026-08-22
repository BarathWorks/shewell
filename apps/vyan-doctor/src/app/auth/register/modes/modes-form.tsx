"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UIFormInput } from "~/components/ui/legacy-form";
import { UIFormLabel } from "~/components/ui/legacy-form";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import ModesUserAction from "./modes-user-action";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";

const modeSchema = z.object({
  sessionMode: z.string({
    required_error: "Please select the Session Mode",
    invalid_type_error: "Please select the Session Mode",
  }),
  // sessionType: z.string({
  //   required_error: "Please select the Session Type",
  //   invalid_type_error: "Please select the Session Type",
  // }).optional(),
  // meetingType: z.string({
  //   required_error: "Please select the Meeting Type ",
  //   invalid_type_error: "Please select the Meeting Type",
  // }).optional(),
  listing: z.string({
    required_error: "Please select the Listing Type ",
    invalid_type_error: "Please select the Listing Type",
  }),
  // issues: z.string({ required_error: "Please select the Issue" }),
});

const ModesForm = ({
  sessionMode,
  // sessionType,
  // meetingType,
  listing,
}: {
  sessionMode: string;
  // sessionType: string;
  // meetingType: string;
  listing: string;
}) => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<z.infer<typeof modeSchema>>({
    defaultValues: {
      sessionMode: sessionMode,
      // sessionType: sessionType,
      // meetingType: "google-meet",
      listing: listing,
    },
    resolver: zodResolver(modeSchema),
  });
  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  if (!session) {
    router.push("/auth/login");
  }
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const pathname = usePathname();
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  params.set("step", "4")

  useEffect(() => {

    params.set("step", "4")
    window.history.pushState(null,"", `${pathname}?${params.toString()}` )
  },[])
  
  const onSubmit = (data: z.infer<typeof modeSchema>) => {
    setLoadingState(true);
    // console.log(data);

    ModesUserAction(data as { sessionMode: string; listing: string })
      .then((resp) => {
        setLoadingState(false);
        // These actions report failure by RETURNING `{ success: false, error }`
        // rather than throwing, so the `.catch` below never sees it. Without this
        // check a failed save showed a success toast and advanced to the next
        // registration step, silently discarding what the practitioner entered.
        if (!resp?.success) {
          toast({
            title: "Could not save",
            description: resp?.error ?? "Please try again",
            variant: "destructive",
          });
          return;
        }

        console.log("uploads", resp?.message);
        toast({
          description: "Successfull Added the modes",
          variant: "default",
        });
        router.push(`/auth/register/uploads/?step=5`);
      })
      .catch((err) => {
        setLoadingState(false);
        toast({
          description: err.message,
          variant: "destructive",
        });
        console.log(err);
      });
  };
  const errorHandler = (e: any) => {
    console.log(e);
  };
  // const { data: session } = useSession();
  // console.log("session", session);
  // if (!session?.user) {
  //   console.log("unauthorised");
  //   redirect("/auth/login");
  // }

  return (
    <>
      {/* <div className="mb-6 text-center  font-inter text-2xl font-semibold md:mb-8  xl:mb-9 2xl:mb-[50px] 2xl:text-3xl">
        Create your free account
      </div> */}
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
          <div>
            <UIFormLabel>Session Mode</UIFormLabel>
            <Controller
              control={control}
              name="sessionMode"
              render={({ field }) => {
                return (
                  <>
                    <Select
                      // value={field.value}
                      onValueChange={field.onChange}
                      defaultValue={sessionMode || ""}
                    >
                      <SelectTrigger className="w-full  rounded-md border border-solid border-hairline py-3  pl-4 font-inter text-sm  font-normal  outline-primary ">
                        <SelectValue placeholder="Select the Session Mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Online">Online</SelectItem>
                        {/* <SelectItem value="Offline">Offline</SelectItem> */}
                      </SelectContent>
                    </Select>
                    {errors && errors.sessionMode && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">
                        {" "}
                        {errors.sessionMode.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel>Session Type</UIFormLabel>
              <Controller
                control={control}
                name="sessionType"
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={sessionType || ""}
                      >
                        <SelectTrigger className="w-full  rounded-md border border-solid border-hairline py-3  pl-4 font-inter text-sm  font-normal  outline-primary ">
                          <SelectValue placeholder="Couple/Single" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="couple">Couple/Family</SelectItem>
                          <SelectItem value="single">Single</SelectItem>
                        </SelectContent>
                      </Select>

                      {errors && errors.sessionType && (
                        <p className="mt-1.5 text-xs font-medium text-danger-600">
                          {" "}
                          {errors.sessionType.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <UIFormLabel>Meeting Type</UIFormLabel>
              <Controller
                control={control}
                name="meetingType"
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        value={field.value || "google-meet"}
                        onValueChange={field.onChange}
                        //  defaultValue = {meetingType  || "google-meet"}
                      >
                        <SelectTrigger className="w-full  rounded-md border border-solid border-hairline py-3  pl-4 font-inter text-sm  font-normal  outline-primary">
                          <SelectValue placeholder="Select Meeting Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="google-meet">
                            Google Meet
                          </SelectItem>
                          
                        </SelectContent>
                      </Select>
                      {errors && errors.meetingType && (
                        <p className="mt-1.5 text-xs font-medium text-danger-600">
                          {" "}
                          {errors.meetingType.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div> */}

          <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel>To Be Listed As</UIFormLabel>
              <Controller
                control={control}
                name="listing"
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={listing || ""}
                      >
                        <SelectTrigger className="w-full  rounded-md border border-solid border-hairline py-3  pl-4 font-inter text-sm  font-normal  outline-primary">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Clinical">Clinical</SelectItem>
                          <SelectItem value="Non Clinical">
                            Non Clinical
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors && errors.listing && (
                        <p className="mt-1.5 text-xs font-medium text-danger-600">
                          {" "}
                          {errors.listing.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            {/* <div className="w-full">
                <UIFormLabel>Issued Handled</UIFormLabel>
                <Controller
                  control={control}
                  name="issues"
                  render={({ field }) => {
                    return (
                      <>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full  rounded-md border border-solid border-hairline  py-3 pl-4 font-inter  text-sm font-normal text-placeholder-color">
                            <SelectValue placeholder="Enter issues you handled" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="google meet">
                              Google Meet
                            </SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors && errors.issues && (
                          <p className="mt-1.5 text-xs font-medium text-danger-600"> {errors.issues.message}</p>
                        )}
                      </>
                    );
                  }}
                />
              </div> */}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:justify-between">
            <Button
              disabled={loadingState}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:w-auto"
              variant="OTP"
              type="submit"
              // onClick={handleSubmit(onSubmit, errorHandler)}
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Saving…" : "Next"}
            </Button>
            <div className=" font-inter text-base font-normal">
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

export default ModesForm;
