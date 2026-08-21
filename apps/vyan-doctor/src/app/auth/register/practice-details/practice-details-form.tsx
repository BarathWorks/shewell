"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import PracticeDetailsUserAction from "./practice-details-user-action";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import LoadingSpinner from "~/app/components/loading-spinner";

const practiceDetailsSchema = z.object({
  department: z.string({ required_error: "Please enter the department" }),
  position: z.string({ required_error: "Please enter the position" }),
  location: z.string({ required_error: "Please enter the location" }),
  experience: z.string({
    required_error: "Please enter years of experience",
  }).refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid number greater than 0",
  }),
  sessionMode: z.string({
    required_error: "Please select the Session Mode",
    invalid_type_error: "Please select the Session Mode",
  }),
  listing: z.string({
    required_error: "Please select the Listing Type",
    invalid_type_error: "Please select the Listing Type",
  }),
});

const PracticeDetailsForm = ({
  department,
  position,
  location,
  experience,
  sessionMode,
  listing,
}: {
  department: string;
  position: string;
  location: string;
  experience: string;
  sessionMode: string;
  listing: string;
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof practiceDetailsSchema>>({
    defaultValues: {
      department: department || "",
      position: position || "",
      location: location || "",
      experience: experience || "",
      sessionMode: sessionMode || "",
      listing: listing || "",
    },
    resolver: zodResolver(practiceDetailsSchema),
  });

  const [loadingState, setLoadingState] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    params.set("step", "6");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  if (!session) {
    router.push("/auth/login");
  }

  const onSubmit = async (data: z.infer<typeof practiceDetailsSchema>) => {
    setLoadingState(true);
    PracticeDetailsUserAction({
      department: data.department!,
      position: data.position!,
      location: data.location!,
      experience: data.experience!,
      sessionMode: data.sessionMode!,
      listing: data.listing!,
    })
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

        toast({
          description: resp?.message,
          variant: "default",
        });
        router.push(`/auth/register/bank-details/?step=7`);
      })
      .catch((err) => {
        setLoadingState(false);
        toast({
          description: err.message,
          variant: "destructive",
        });
      });
  };

  const errorHandler = (e: any) => {
    console.log(e);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6"
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6">
          {/* Department */}
          <div>
            <UIFormLabel>Department*</UIFormLabel>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <>
                  <UIFormInput
                    className="placeholder:text-black"
                    type="text"
                    placeholder="Enter your department"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors?.department && (
                    <p className="text-red-500 text-sm">
                      {errors.department.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Position & Location */}
          <div className="flex gap-4 xl:gap-6 w-full">
            <div className="w-full">
              <UIFormLabel>Position*</UIFormLabel>
              <Controller
                control={control}
                name="position"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your position"
                      className="placeholder:text-black pr-3"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors?.position && (
                      <p className="text-red-500 text-sm">
                        {errors.position.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="w-full">
              <UIFormLabel>Hospital Location*</UIFormLabel>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      className="placeholder:text-black pr-3"
                      placeholder="Enter the hospital's location"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors?.location && (
                      <p className="text-red-500 text-sm">
                        {errors.location.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Experience */}
          <div>
            <UIFormLabel>Years of Experience*</UIFormLabel>
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="number"
                    min="0"
                    placeholder="Enter years of experience (e.g., 5)"
                    className="placeholder:text-black"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors?.experience && (
                    <p className="text-red-500 text-sm">
                      {errors.experience.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Session Mode */}
          <div>
            <UIFormLabel>Session Mode*</UIFormLabel>
            <Controller
              name="sessionMode"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-md border border-solid border-[#e9e9e9] py-3 pl-4 font-inter text-sm font-normal outline-primary">
                      <SelectValue placeholder="Select Session Mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.sessionMode && (
                    <p className="text-red-500 text-sm">
                      {errors.sessionMode.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Listing */}
          <div>
            <UIFormLabel>Listing*</UIFormLabel>
            <Controller
              name="listing"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-md border border-solid border-[#e9e9e9] py-3 pl-4 font-inter text-sm font-normal outline-primary">
                      <SelectValue placeholder="Select Listing Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem value="Clinical">Clinical</SelectItem>
                        <SelectItem value="Non Clinical">
                          Non Clinical
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.listing && (
                    <p className="text-red-500 text-sm">
                      {errors.listing.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:justify-between">
            <Button
              disabled={loadingState}
              className="w-[260px] xl:order-last xl:w-[164px]"
              variant="OTP"
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : " Next"}
            </Button>
            <div className=" font-inter text-base font-normal">
              Already have a account?{" "}
              <Link
                className="ml-3 font-poppins text-base font-medium text-primary"
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

export default PracticeDetailsForm;
