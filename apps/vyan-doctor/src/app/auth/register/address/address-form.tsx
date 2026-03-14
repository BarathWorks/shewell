"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { useForm, Controller } from "react-hook-form";
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
import AddressUserAction from "./address-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
import { fetchStatesByCountry } from "./fetch-states-action";

const addressSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  stateId: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  completeAddress: z.string().min(10, "Address must be at least 10 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
});

interface AddressFormProps {
  countries: { id: string; name: string }[];
  existingAddress?: {
    countryId: string | null;
    stateId: string | null;
    city: string;
    completeAddress: string;
    pincode: string;
  } | null;
}

const AddressForm = ({ countries, existingAddress }: AddressFormProps) => {
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof addressSchema>>({
    defaultValues: {
      countryId: existingAddress?.countryId || "",
      stateId: existingAddress?.stateId || "",
      city: existingAddress?.city || "",
      completeAddress: existingAddress?.completeAddress || "",
      pincode: existingAddress?.pincode || "",
    },
    resolver: zodResolver(addressSchema),
  });

  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const watchCountryId = watch("countryId");

  useEffect(() => {
    params.set("step", "3");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  useEffect(() => {
    if (watchCountryId) {
      fetchStatesByCountry(watchCountryId).then((statesData) => {
        setStates(statesData);
        if (statesData.length === 1 && statesData[0]) {
          setValue("stateId", statesData[0].id);
        }
      });
    }
  }, [watchCountryId, setValue]);

  const onSubmit = async (data: z.infer<typeof addressSchema>) => {
    setLoadingState(true);
    try {
      const resp = await AddressUserAction({
        countryId: data.countryId,
        stateId: data.stateId,
        city: data.city,
        completeAddress: data.completeAddress,
        pincode: data.pincode,
      });
      setLoadingState(false);
      toast({
        description: resp?.message,
        variant: "default",
      });
      router.push(`/auth/register/identity-documents/?step=4`);
    } catch (err: any) {
      setLoadingState(false);
      toast({
        description: err.message,
        variant: "destructive",
      });
    }
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
          {/* Country */}
          <div>
            <UIFormLabel>Country*</UIFormLabel>
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("stateId", "");
                    }}
                  >
                    <SelectTrigger className="w-full rounded-md border border-solid border-[#e9e9e9] py-3 pl-4 font-inter text-sm font-normal outline-primary">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.countryId && (
                    <p className="text-red-500 text-sm">
                      {errors.countryId.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* State */}
          <div>
            <UIFormLabel>State*</UIFormLabel>
            <Controller
              name="stateId"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!watchCountryId}
                  >
                    <SelectTrigger className="w-full rounded-md border border-solid border-[#e9e9e9] py-3 pl-4 font-inter text-sm font-normal outline-primary">
                      <SelectValue
                        placeholder={
                          watchCountryId
                            ? "Select state"
                            : "Select country first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.stateId && (
                    <p className="text-red-500 text-sm">
                      {errors.stateId.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* City */}
          <div>
            <UIFormLabel>City*</UIFormLabel>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter your city"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors?.city && (
                    <p className="text-red-500 text-sm">
                      {errors.city.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Complete Address */}
          <div>
            <UIFormLabel>Complete Address*</UIFormLabel>
            <Controller
              name="completeAddress"
              control={control}
              render={({ field }) => (
                <>
                  <textarea
                    className="w-full rounded-md border border-border-color py-3 pl-4 outline-primary placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-placeholder-color"
                    placeholder="Enter your complete address (min 10 characters)"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors?.completeAddress && (
                    <p className="text-red-500 text-sm">
                      {errors.completeAddress.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Pincode */}
          <div>
            <UIFormLabel>Pincode*</UIFormLabel>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors?.pincode && (
                    <p className="text-red-500 text-sm">
                      {errors.pincode.message}
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
            <div className=" font-inter text-sm font-normal sm:text-base">
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

export default AddressForm;
