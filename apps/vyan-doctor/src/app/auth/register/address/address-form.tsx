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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Address</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {/* Country */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Country*</UIFormLabel>
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
                    <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.countryId.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* State */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">State*</UIFormLabel>
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
                    <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.stateId.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* City */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">City*</UIFormLabel>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter your city"
                    value={field.value || ""}
                    onChange={field.onChange}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Complete Address */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Complete Address*</UIFormLabel>
            <Controller
              name="completeAddress"
              control={control}
              render={({ field }) => (
                <>
                  <textarea
                    className="w-full rounded-lg border-none bg-[#f1f5f9] px-4 py-3 text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal min-h-[100px]"
                    placeholder="Enter your complete address (min 10 characters)"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                  {errors?.completeAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.completeAddress.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Pincode */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Pincode*</UIFormLabel>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={field.value || ""}
                    onChange={field.onChange}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.pincode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pincode.message}
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

export default AddressForm;
