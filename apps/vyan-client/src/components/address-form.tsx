"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import AddsInput from "./address-form-input";
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
    .string({ required_error: "Pin code is required" })
    .regex(new RegExp(/^\d{5}-\d{3}$/), {
      message: "Please enter the valid Pin code",
    }),
  locality: z.string({ required_error: "Locality is required" }),
});
const AddressForm = () => {
  const [badge, setBadge] = useState<
    | "address"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "selectedAddress"
    | null
    | undefined
  >("address");
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
      <div className="py-[12px] md:py-4 xl:py-[18px]">
        <form onSubmit={handleSubmit(submitForm)}>
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
                        <AddsInput
                          type="text"
                          placeholder="e.g Mohit"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors && errors.name && (
                          <p className="text-red-500">{errors.name.message}</p>
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
                        <AddsInput
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
                        <AddsInput
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
                      <AddsInput
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
                  onClick={() => setBadge("selectedAddress")}
                  variant={badge}
                >
                  Work
                </Badge>
                <Badge
                  onClick={() => setBadge("selectedAddress")}
                  variant={badge}
                >
                  Home
                </Badge>
                <Badge
                  onClick={() => setBadge("selectedAddress")}
                  variant={badge}
                >
                  College
                </Badge>
                <Badge
                  onClick={() => setBadge("selectedAddress")}
                  variant={badge}
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
        </form>
      </div>
    </>
  );
};
export default AddressForm;
