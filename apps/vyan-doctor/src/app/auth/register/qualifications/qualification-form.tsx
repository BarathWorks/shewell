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
      required_error: "Please enter the experience ",
      invalid_type_error: "Please enter the experience",
    }),
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
  })
  .refine((data) => parseInt(data.startingYear) < parseInt(data.endingYear), {
    message: "Starting Year must be less than ending year",
    path: ["startingYear"],
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6 "
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
          <div>
            <UIFormLabel>Designation or Degree</UIFormLabel>
            <Controller
              name="degree"
              control={control}
              render={({ field }) => {

                return (
                  <>
                    <UIFormInput
                      className="placeholder:text-black"
                      placeholder="Enter your Degree"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    {errors && errors.degree && (
                      <p className="text-red-500 text-sm"> {errors.degree.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row xl:gap-6 ">
            <div className="w-full">
              <UIFormLabel>College/University Name</UIFormLabel>
              <Controller
                name="collegeName"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        className="placeholder:text-black"
                        placeholder="Enter college or university name"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {errors && errors.collegeName && (
                        <p className="text-red-500 text-sm"> {errors.collegeName.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <UIFormLabel>Completion Date</UIFormLabel>
              <Controller
                name="completionDate"
                control={control}
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        type="date"
                        className="placeholder:text-black"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors && errors.completionDate && (
                        <p className="text-red-500 text-sm"> {errors.completionDate.message}</p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          {
            <div>
              <UIFormLabel>Language</UIFormLabel>
              <Controller
                name="languages"
                control={control}
                render={({ field }) => {

                  return (
                    <>
                      <Multiselect
                        placeholder="Select"
                        className=" text-black "
                        options={languagesOptions} // Options to display in the dropdown
                        selectedValues={field.value} // Preselected value to persist in dropdown
                        onSelect={(selectedList, selectedItem) =>
                          field.onChange(selectedList)
                        } // Update form state on select
                        onRemove={(selectedList, removedItem) =>
                          field.onChange(selectedList)
                        } // Update form state on remove
                        displayValue="name" // Property name to display in the dropdown options
                      />

                      {errors && errors.languages && (
                        <p className="text-red-500 text-sm">
                          {" "}
                          {errors.languages.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          }

          <div>
            <UIFormLabel>Gender</UIFormLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      // defaultValue={gender || ""}
                    >
                      <SelectTrigger className="w-full  rounded-md border border-solid border-[#e9e9e9] py-3  pl-4 font-inter text-sm  font-normal  outline-primary">
                        <SelectValue placeholder="Enter your sex " />
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
                      <p className="text-red-500 text-sm"> {errors.gender.message}</p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="w-full">
            <UIFormLabel>Experience</UIFormLabel>
            <div className="flex w-full flex-col gap-4 xl:gap-6">

              <div className="flex gap-4 w-full xl:gap-6 flex-col">
                {/* starting and ending year */}
                <div className="flex items-center gap-2 w-full ">
                  <div className="w-full">
                    {/* <Controller
                      control={control}
                      name="startingYear"
                      rules={{
                        validate: (value) => {
                          if (!/^\d{0,4}$/.test(value)) {
                            return "Value must be a number up to 4 digits";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => {
                        return (
                          <>
                            <UIFormInput
                              className="w-full placeholder:text-black"
                              type="number"
                              placeholder="Starting Year"
                              value={field.value}
                              onChange={(e) => {
                                const newValue = e.target.value;

                                if (/^\d{0,4}$/.test(newValue)) {
                                  field.onChange(e);
                                }
                              }}
                             
                            />

                            {errors && errors.startingYear && (
                              <p className="text-red-500">
                                {" "}
                                {errors.startingYear.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    /> */}
                    <Controller
                      name="startingYear"
                      control={control}
                      render={({ field }) => {
                        return (
                          <>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              // defaultValue={gender || ""}
                            >
                              <SelectTrigger className="w-full  rounded-md border border-solid border-[#e9e9e9] py-3  pl-4 font-inter text-sm  font-normal  outline-primary">
                                <SelectValue placeholder="e.g 2000" />
                              </SelectTrigger>
                              <SelectContent className="bg-white w-full">
                                <SelectGroup>
                                  {years.length &&
                                    years.map((year) => {
                                      return (
                                        <SelectItem
                                          value={year.value.toString()}
                                          key={year.value}
                                        >
                                          {year.label}
                                        </SelectItem>
                                      );
                                    })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {errors && errors.startingYear && (
                              <p className="text-red-500 text-sm">
                                {" "}
                                {errors.startingYear.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                  {/* <div className="border">-</div> */}
                  <div className="w-full">
                  <Controller
                      name="endingYear"
                      control={control}
                      render={({ field }) => {
                        return (
                          <>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              // defaultValue={gender || ""}
                            >
                              <SelectTrigger className="w-full  rounded-md border border-solid border-[#e9e9e9] py-3  pl-4 font-inter text-sm  font-normal  outline-primary">
                                <SelectValue placeholder="e.g 2004" />
                              </SelectTrigger>
                              <SelectContent className="bg-white w-full">
                                <SelectGroup>
                                  {years.length &&
                                    years.map((year) => {
                                      return (
                                        <SelectItem
                                          value={year.value.toString()}
                                          key={year.value}
                                        >
                                          {year.label}
                                        </SelectItem>
                                      );
                                    })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {errors && errors.endingYear && (
                              <p className="text-red-500 text-sm">
                                {" "}
                                {errors.endingYear.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                </div>

             {/* department */}
               <Controller
                  control={control}
                  name="department"
                  render={({ field }) => {
                    return (
                      <>
                        <div className="flex flex-col">
                        <UIFormInput
                          className="placeholder:text-black"
                          type="text"
                          placeholder="Enter your department"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors && errors.department && (
                          <p className="text-red-500 text-sm">
                            {" "}
                            {errors.department.message}
                          </p>
                        )}
                        </div>
                      </>
                    );
                  }}
                />
            
              </div>

              {/* enter your position and hospital location */}
              <div className="flex gap-4 xl:gap-6 w-full">
                {/* position */}
                <div className="w-full">
                <Controller
                  control={control}
                  name="position"
                  render={({ field }) => {
                    return (
                      <>
                        <div className="flex flex-col">
                        <UIFormInput
                          type="text"
                          placeholder="Enter your postition"
                          className="placeholder:text-black pr-3"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors && errors.position && (
                          <p className="text-red-500 text-sm">
                            {" "}
                            {errors.position.message}
                          </p>
                        )}
                        </div>
                      </>
                    );
                  }}
                />
                </div>
                {/* hospital */}
                <div className="w-full">
                <Controller
                  control={control}
                  name="location"
                  render={({ field }) => {
                    return (
                      <>
                        <div className="flex flex-col">
                        <UIFormInput
                          type="text"
                          className="placeholder:text-black pr-3"
                          placeholder="Enter the hosptial's location"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors && errors.location && (
                          <p className="text-red-500 text-sm">
                            {" "}
                            {errors.location.message}
                          </p>
                        )}
                        </div>
                      </>
                    );
                  }}
                />
                </div>
              </div>
            </div>
          </div>

          <div>
            <UIFormLabel>Qualification to be displayed as</UIFormLabel>
            <Controller
              control={control}
              name="displayedQualificationId"
              render={({ field }) => {
                return (
                  <>
                    {/* <UIFormInput
                      type="text"
                      placeholder="Qualification to be displayed as"
                      value={field.value}
                      onChange={field.onChange}
                    /> */}
                    <Select
                      value={field.value || ""}
                      onValueChange={(e) => {
                        setSelectedDisplayedQualification(e), field.onChange(e);
                      }}
                    >
                      <SelectTrigger className=" w-full  rounded-md border border-solid border-[#e9e9e9] py-3  pl-4 font-inter text-sm  font-normal  outline-primary ">
                        <SelectValue placeholder="Qualification to be displayed as" />
                      </SelectTrigger>
                      <SelectContent className=" bg-white">
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
                      <p className="text-red-500 text-sm">
                        {" "}
                        {errors.displayedQualificationId.message}
                      </p>
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
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : " Next"}
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
     
    </>
  );
};

export default QualificationForm;
