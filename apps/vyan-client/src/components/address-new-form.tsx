"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import AddFormInput from "./address-form-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { Badge } from "@repo/ui/src/@/components/badge";
import { useState } from "react";
import { Button } from "@repo/ui/src/@/components/button";
import { RadioGroup, RadioGroupItem } from "@repo/ui/src/@/components/radio-group";

const addressFormSchema = z.object({
  country: z.string({ required_error: "Please select the country" }),
  name: z.string({ required_error: "Name is required" }),
  phoneNumber: z
    .string({ required_error: "Phone Number is required" })
    .max(10, { message: "Phone Number can have maximum 10 digits" })
    .regex(new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/), {
      message: "only Numeric Digits are allowed",
    }),
  landMark: z.string({ required_error: "LandMark is required" }),
  pinCode: z
    .string({ required_error: "Pin code is required" }),
  // .regex(new RegExp(/^\d{5}-\d{3}$/), {
  //   message: "Please enter the valid Pin code",
  // }),
  locality: z.string({ required_error: "Locality is required" }),
  radioButton: z.string(),
});
const AddressNewForm = () => {
  const [badge, setBadge] = useState<string>("work");
  const handleBadgeClick = (badgeId: string) => {
    setBadge(badgeId);
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
  });
  const submitForm = (data: z.infer<typeof addressFormSchema>) => {
  
  };

  return (
    <>
      <div className="p-2 md:p-[18px] xl:basis-[741px] xl:p-5 2xl:basis-[946px] 2xl:p-8">
        <div className="flex flex-col gap-[14px] md:gap-4 xl:gap-[18px]">
          {/* div-adds-1 */}
          <div>
            <h3 className="mb-[4px] font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:mb-2 xl:text-base 2xl:text-[28px] 2xl:leading-[38px]">
              Delivery Address
            </h3>
            <div className="font-inter text-[12px] font-normal leading-4 text-inactive md:text-sm xl:text-base ">
              Add your address to deliver the product without any hustle
            </div>
          </div>
          {/* div-adds-2 */}
          <div>
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="flex flex-col gap-[14px] md:gap-[18px]">
                <div className="rounded-md border border-primary p-2 md:p-5">
                  <Controller
                    control={control}
                    name="radioButton"
                    render={({ field }) => {
                      return (
                        <>
                          <div className="flex gap-2">
                            <div className="self-start">
                              <input
                                type="radio"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </div>
                            <div className="flex flex-col gap-[10px]">
                              {/* div-1 */}
                              <div>
                                <div className="mb-1 font-inter font-medium text-active">
                                  Mohit
                                </div>
                                <div className="flex flex-col gap-[2px]">
                                  <div className="font-inter text-sm font-normal text-inactive lg:text-base">
                                    Mobile : +91 9746890012
                                  </div>
                                  <div className="font-inter text-sm font-normal text-inactive lg:text-base">
                                    Islampur colony medanta hospital gurgaon
                                    112019
                                  </div>
                                </div>
                              </div>
                              {/* div-2 */}
                              <div className="flex gap-10">
                                <div className="font-inter text-base font-normal text-active">
                                  Edit
                                </div>
                                <div className="font-inter text-base font-normal  text-red-500">
                                  Delete
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-full border border-hairline-strong"></div>
                  <div className="h-6 font-inter text-base font-medium text-[#BFBFBF]">
                    {" "}
                    or{" "}
                  </div>
                  <div className="w-full border border-hairline-strong"></div>
                </div>

                <div className="flex flex-col gap-3 md:gap-6">
                  {/* div-1 */}
                  <div>
                    <UIFormLabel>Country/ Region</UIFormLabel>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => {
                        return (
                          <>
                            <Select>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Theme" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        );
                      }}
                    />
                  </div>
                  {/* div-2 */}
                  <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                    {/* div-2-a */}
                    <div className="w-full">
                      <UIFormLabel>Name </UIFormLabel>
                      <Controller
                        control={control}
                        name="name"
                        render={({ field }) => {
                          return (
                            <>
                              <AddFormInput
                                type="text"
                                placeholder="e.g Mohit"
                                value={field.value}
                                onChange={field.onChange}
                              />
                              {errors && errors.name && (
                                <p className="text-red-500">
                                  {errors.name.message}
                                </p>
                              )}
                            </>
                          );
                        }}
                      />
                    </div>
                    {/* div-2-b */}
                    <div className="w-full">
                      <UIFormLabel>Phone Number </UIFormLabel>
                      <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field }) => {
                          return (
                            <>
                              <AddFormInput
                                type="text"
                                placeholder="e.g +91 9756576556"
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
                  {/* div-3 */}
                  <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                    {/* div-3-a */}
                    <div className="w-full">
                      <UIFormLabel>Landmark</UIFormLabel>
                      <Controller
                        control={control}
                        name="landMark"
                        render={({ field }) => {
                          return (
                            <>
                              <textarea
                                className="w-full rounded-md border border-hairline py-[11px] pl-[14px] font-inter text-sm font-normal text-muted placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-muted"
                                placeholder="eg. Near shiv mandir"
                                value={field.value}
                                onChange={field.onChange}
                              ></textarea>
                              {errors && errors.landMark && (
                                <p className="text-red-500">
                                  {errors.landMark.message}
                                </p>
                              )}
                            </>
                          );
                        }}
                      />
                    </div>
                    {/* div-3-b */}
                    <div className="w-full">
                      <UIFormLabel>Pin code </UIFormLabel>
                      <Controller
                        control={control}
                        name="pinCode"
                        render={({ field }) => {
                          return (
                            <>
                              <AddFormInput
                                type="text"
                                placeholder="eg. 132103"
                                value={field.value}
                                onChange={field.onChange}
                              />
                              {errors && errors.pinCode && (
                                <p className="text-red-500">
                                  {errors.pinCode.message}
                                </p>
                              )}
                            </>
                          );
                        }}
                      />
                    </div>
                  </div>
                  {/* div-4 */}
                  <div>
                    <UIFormLabel>Locality</UIFormLabel>
                    <Controller
                      control={control}
                      name="locality"
                      render={({ field }) => {
                        return (
                          <>
                            <AddFormInput
                              type="text"
                              placeholder="Add your locality"
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {errors && errors.locality && (
                              <p className="text-red-500">
                                {errors.locality.message}
                              </p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                  {/* div-5 */}
                  <div>
                    <UIFormLabel>Save Address as</UIFormLabel>
                    <div className="flex gap-3 rounded-md border border-hairline py-[13px] pl-[14px] ">
                      <Badge
                        className="cursor-pointer"
                        onClick={() => handleBadgeClick("work")}
                        variant={badge === "work" ? "selectedAddress" : "address"}
                      >
                        Work
                      </Badge>
                      <Badge
                        className="cursor-pointer"
                        onClick={() => handleBadgeClick("home")}
                        variant={badge === "home" ? "selectedAddress" : "address"}
                      >
                        Home
                      </Badge>
                      <Badge
                        className="cursor-pointer"
                        onClick={() => handleBadgeClick("college")}
                        variant={badge === "college" ? "selectedAddress" : "address"}
                      >
                        College
                      </Badge>
                      <Badge
                        className="cursor-pointer"
                        onClick={() => setBadge("others")}
                        variant={badge === "others" ? "selectedAddress" : "address"}
                      >
                        Others
                      </Badge>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-[194px] self-end bg-primary px-[51px] py-2 font-inter text-[14px] font-medium leading-6 shadow-[2px_2px_4px_0px_rgb(64,64,64)] "
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default AddressNewForm;
