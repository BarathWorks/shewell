"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/@/components/button";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import Link from "next/link";
import { getYear } from "date-fns";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import QualificationUserAction from "./qualifications-user-action";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { fetchCities } from "~/app/actions/qualification-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import Multiselect from "multiselect-react-dropdown";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@repo/ui/src/@/components/input-otp";
import LoadingSpinner from "~/app/components/loading-spinner";
import React from "react";

interface ILanguageProps {
  id: string;
  name: string;
}
const qualificationSchema = z
  .object({
    degree: z.string({ required_error: "Please enter the degree" }),
    collegeName: z.string({ required_error: "Please enter the college name" }),
    completionDate: z.string({ required_error: "Please enter the completion date" }),
    languages: z
      .array(
        z.object({ id: z.string(), name: z.string() }),
      )
      .min(1, { message: "Please select atleast one language" }),
    gender: z.string({
      required_error: "Please select the Gender",
      invalid_type_error: "Please select the Gender",
    }),
    startingYear: z.string({
      required_error: "Please enter your experience",
      invalid_type_error: "Please enter your experience",
    }).min(1, "Please enter your experience"),
    endingYear: z.string({
      required_error: "Please enter the ending year",
      invalid_type_error: "Please enter the ending year",
    }),
    department: z.string({ required_error: "Please enter the department " }),
    position: z.string({ required_error: "Please enter the position " }),
    location: z.string({ required_error: "Please enter the location " }),
    displayedQualificationId: z.string({
      required_error: "Please select the displayed qualification",
      invalid_type_error: "Please select the displayed qualification",
    }),
  });
interface ISpecialization {
  value: string;
  label: string;
}
interface ISpecializationForm {
  specializations: ISpecialization[];
}
interface IQualificationsInputs {
  degree: string;
  languagesOptions: ILanguageProps[];
  gender: string;
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
  displayedQualificationId: string;
  stateId: string;
  cityId: string;
}
interface IQualifications {
  degree: string;
  collegeName: string;
  completionDate: string;
  languages: ILanguageProps[];
  gender: string;
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
  displayedQualificationId: string;
}
const QualificationForm = ({
  languagesOptions,
  specialisations,
  degree,
  gender,
  department,
  position,
  location,
  displayQualificationId,
  startingYear,
  endingYear,
  defaultLanguages,
}: {
  languagesOptions: { id: string; name: string }[];
  specialisations: ISpecialization[];
  degree: string;
  gender: string;
  department: string;
  position: string;
  location: string;
  displayQualificationId: string;
  startingYear: string;
  endingYear: string;
  defaultLanguages: { id: string; name: string }[];
}) => {
  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof qualificationSchema>>({
    defaultValues: {
      degree: degree,
      collegeName: "",
      completionDate: "",
      gender: gender,
      languages: defaultLanguages,
      department: department,
      position: position,
      location: location,
      displayedQualificationId: displayQualificationId,
      startingYear: startingYear,
      endingYear: endingYear,
    },
    resolver: zodResolver(qualificationSchema),
  });
  const [loadingState, setLoadingState] = useState<boolean>(false);



  const [selectedDisplayedQualification, setSelectedDisplayedQualification] =
    useState<string>();

  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  if (!session) {
    router.push("/auth/login");
  }
  // Get the current year using date-fns
  const currentYear = getYear(new Date());
  // console.log("currentYear", currentYear);

  // Create an array of objects from 1900 to the current year
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
    const year = 1900 + i;
    return { value: year, label: year.toString() };
  });

  const pathname = usePathname();
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  params.set("step", "3")

  useEffect(() => {

    params.set("step", "3")
    window.history.pushState(null,"", `${pathname}?${params.toString()}` )
  },[])

  // console.log("years", years);

  const onSubmit = (data: IQualifications) => {
    console.log("qualificatonData", data);
    setLoadingState(true);
    QualificationUserAction(data)
      .then((resp) => {
        setLoadingState(false);
        console.log("qualifications", resp?.message);
        toast({
          description: resp?.message,
          variant: "default",
        });
        router.push(`/auth/register/modes/?step=4`);
      })
      .catch((err) => {
        setLoadingState(false);
        console.log("qualificatonError", err);
        toast({
          description: err,
          variant: "destructive",
        });
      });
  };
  const errorHandler = (e: any) => {
    console.log(e);
  };

  

  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Qualifications</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Designation or Degree</UIFormLabel>
            <Controller
              name="degree"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      placeholder="Enter your Degree"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.degree && (
                      <p className="text-red-500 text-sm mt-1"> {errors.degree.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-5">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">College/University Name</UIFormLabel>
              <Controller
                name="collegeName"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="Enter college or university name"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.collegeName && (
                        <p className="text-red-500 text-sm mt-1"> {errors.collegeName.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Completion Date</UIFormLabel>
              <Controller
                name="completionDate"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        type="date"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.completionDate && (
                        <p className="text-red-500 text-sm mt-1"> {errors.completionDate.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Language</UIFormLabel>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <Multiselect
                      placeholder="Select Languages"
                      className="text-slate-900 font-sans"
                      options={languagesOptions}
                      selectedValues={field.value}
                      onSelect={(selectedList, selectedItem) =>
                        field.onChange(selectedList)
                      }
                      onRemove={(selectedList, removedItem) =>
                        field.onChange(selectedList)
                      }
                      displayValue="name"
                      style={{
                        searchBox: {
                          border: "none",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "8px",
                          padding: "10px 16px",
                        },
                        chips: {
                          background: "#2c5f71",
                        }
                      }}
                    />
                    {errors && errors.languages && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.languages.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Gender</UIFormLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
                        <SelectValue placeholder="Enter your sex" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors && errors.gender && (
                      <p className="text-red-500 text-sm mt-1"> {errors.gender.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Experience (in Years)*</UIFormLabel>
            <div className="flex flex-col gap-6">
              <div className="w-full">
                <Controller
                  name="startingYear"
                  control={control}
                  render={({ field }) => {
                    const displayValue = field.value
                      ? (new Date().getFullYear() - parseInt(field.value)).toString()
                      : "";
                    
                    return (
                      <>
                        <UIFormInput
                          type="number"
                          placeholder="e.g 5"
                          value={displayValue}
                          onChange={(e) => {
                            let newValue = e.target.value;
                            if (newValue === "") {
                              field.onChange("");
                              setValue("endingYear", "");
                            } else if (/^\d{0,2}$/.test(newValue)) {
                              const yearsOfExp = parseInt(newValue);
                              const currentYear = new Date().getFullYear();
                              const startYear = (currentYear - yearsOfExp).toString();
                              
                              field.onChange(startYear);
                              setValue("endingYear", currentYear.toString());
                            }
                          }}
                          style={{ border: "none" }}
                          className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                        />
                        {errors && errors.startingYear && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.startingYear.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>

              <div>
                <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Department*</UIFormLabel>
                <Controller
                  control={control}
                  name="department"
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormInput
                          type="text"
                          placeholder="Enter your department"
                          value={field.value || ""}
                          onChange={field.onChange}
                          style={{ border: "none" }}
                          className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                        />
                        {errors && errors.department && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.department.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:gap-5 w-full">
                <div className="w-full">
                  <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Position*</UIFormLabel>
                  <Controller
                    control={control}
                    name="position"
                    render={({ field }) => {
                      return (
                        <>
                          <UIFormInput
                            type="text"
                            placeholder="Enter your position"
                            value={field.value || ""}
                            onChange={field.onChange}
                            style={{ border: "none" }}
                            className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                          />
                          {errors && errors.position && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.position.message}
                            </p>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
                <div className="w-full">
                  <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Hospital Location*</UIFormLabel>
                  <Controller
                    control={control}
                    name="location"
                    render={({ field }) => {
                      return (
                        <>
                          <UIFormInput
                            type="text"
                            placeholder="Enter the hospital's location"
                            value={field.value || ""}
                            onChange={field.onChange}
                            style={{ border: "none" }}
                            className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                          />
                          {errors && errors.location && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.location.message}
                            </p>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Qualification to be displayed as*</UIFormLabel>
            <Controller
              control={control}
              name="displayedQualificationId"
              render={({ field }) => {
                return (
                  <>
                    <Select
                      value={field.value || ""}
                      onValueChange={(e) => {
                        setSelectedDisplayedQualification(e), field.onChange(e);
                      }}
                    >
                      <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
                        <SelectValue placeholder="Qualification to be displayed as" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          {specialisations &&
                            specialisations.map((item) => {
                              return (
                                <SelectItem value={item.value} key={item.value}>
                                  {item.label}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors && errors.displayedQualificationId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.displayedQualificationId.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Submit */}
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

export default QualificationForm;
