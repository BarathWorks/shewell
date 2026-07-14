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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Practice Details</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {/* Department */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Department*</UIFormLabel>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter your department"
                    value={field.value || ""}
                    onChange={field.onChange}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.department.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Position & Location */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-5">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Position*</UIFormLabel>
              <Controller
                control={control}
                name="position"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your position"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors?.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.position.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Hospital Location*</UIFormLabel>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter the hospital's location"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors?.location && (
                      <p className="text-red-500 text-sm mt-1">
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
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Years of Experience*</UIFormLabel>
            <Controller
              control={control}
              name="experience"
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="number"
                    min="0"
                    placeholder="Enter years of experience (e.g., 5)"
                    value={field.value || ""}
                    onChange={field.onChange}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.experience && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.experience.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Session Mode */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Session Mode*</UIFormLabel>
            <Controller
              name="sessionMode"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
                      <SelectValue placeholder="Select Session Mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.sessionMode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.sessionMode.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Listing */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Listing*</UIFormLabel>
            <Controller
              name="listing"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.listing.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Submit */}
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

export default PracticeDetailsForm;
