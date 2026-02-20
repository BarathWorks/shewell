"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/src/@/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import AddressIdentityUserAction from "./address-identity-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
import { fetchStatesByCountry } from "./fetch-states-action";

const addressIdentitySchema = z.object({
  // Address Details
  countryId: z.string().min(1, "Country is required"),
  stateId: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  completeAddress: z.string().min(10, "Please enter complete address (minimum 10 characters)"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  
  // Identity Details
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z.string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional()
    .or(z.literal("")),
  licenseNumber: z.string().optional(),
});

interface AddressIdentityFormProps {
  countries: { id: string; name: string }[];
  existingAddress?: {
    countryId: string | null;
    stateId: string | null;
    city: string;
    completeAddress: string;
    pincode: string;
  } | null;
  existingIdentity?: {
    panNumber: string | null;
    aadhaarNumber: string | null;
    licenseNumber: string | null;
  } | null;
}

const AddressIdentityForm = ({
  countries,
  existingAddress,
  existingIdentity,
}: AddressIdentityFormProps) => {
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof addressIdentitySchema>>({
    defaultValues: {
      countryId: existingAddress?.countryId || "",
      stateId: existingAddress?.stateId || "",
      city: existingAddress?.city || "",
      completeAddress: existingAddress?.completeAddress || "",
      pincode: existingAddress?.pincode || "",
      panNumber: existingIdentity?.panNumber || "",
      aadhaarNumber: existingIdentity?.aadhaarNumber || "",
      licenseNumber: existingIdentity?.licenseNumber || "",
    },
    resolver: zodResolver(addressIdentitySchema),
  });

  const selectedCountryId = watch("countryId");

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      setLoadingStates(true);
      fetchStatesByCountry(selectedCountryId)
        .then((fetchedStates) => {
          setStates(fetchedStates);
          setLoadingStates(false);
        })
        .catch((error) => {
          console.error("Error fetching states:", error);
          setLoadingStates(false);
          toast({
            title: "Error",
            description: "Failed to load states",
            variant: "destructive",
          });
        });
    } else {
      setStates([]);
    }
  }, [selectedCountryId]);

  const { toast } = useToast();
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const router = useRouter();

  useEffect(() => {
    params.set("step", "2");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  const onSubmit = (data: z.infer<typeof addressIdentitySchema>) => {
    setLoadingState(true);
    console.log(data);
    AddressIdentityUserAction({
      countryId: data.countryId,
      stateId: data.stateId,
      city: data.city,
      completeAddress: data.completeAddress,
      pincode: data.pincode,
      panNumber: data.panNumber || null,
      aadhaarNumber: data.aadhaarNumber || null,
      licenseNumber: data.licenseNumber || null,
    })
      .then((resp) => {
        setLoadingState(false);
        console.log("Address & Identity Saved:", resp?.message);
        toast({
          title: "Details Saved Successfully",
          variant: "default",
        });
        router.push("/auth/register/qualifications?step=3");
      })
      .catch((err) => {
        setLoadingState(false);
        console.log(err);
        toast({
          title: "Failed to save details",
          description: err.message || "Please try again",
          variant: "destructive",
        });
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Address Section */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Address Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <UIFormLabel>Country *</UIFormLabel>
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
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
              )}
            />
            {errors.countryId && (
              <p className="text-red-500 text-sm mt-1">{errors.countryId.message}</p>
            )}
          </div>
          
          <div>
            <UIFormLabel>State *</UIFormLabel>
            <Controller
              name="stateId"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={!selectedCountryId || loadingStates}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingStates ? "Loading..." : "Select state"} />
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
              )}
            />
            {errors.stateId && (
              <p className="text-red-500 text-sm mt-1">{errors.stateId.message}</p>
            )}
          </div>
        </div>

        <div>
          <UIFormLabel>City *</UIFormLabel>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <UIFormInput {...field} placeholder="Enter city" />
            )}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <UIFormLabel>Complete Address *</UIFormLabel>
          <Controller
            name="completeAddress"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter complete address"
              />
            )}
          />
          {errors.completeAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.completeAddress.message}</p>
          )}
        </div>

        <div>
          <UIFormLabel>Pincode *</UIFormLabel>
          <Controller
            name="pincode"
            control={control}
            render={({ field }) => (
              <UIFormInput
                {...field}
                maxLength={6}
                placeholder="Enter 6-digit pincode"
              />
            )}
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
          )}
        </div>
      </div>

      {/* Identity Section */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Identity Details</h2>
        
        <div>
          <UIFormLabel>PAN Number</UIFormLabel>
          <Controller
            name="panNumber"
            control={control}
            render={({ field }) => (
              <UIFormInput
                {...field}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="uppercase"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            )}
          />
          {errors.panNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.panNumber.message}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">Format: 5 letters + 4 digits + 1 letter</p>
        </div>

        <div>
          <UIFormLabel>Aadhaar Number</UIFormLabel>
          <Controller
            name="aadhaarNumber"
            control={control}
            render={({ field }) => (
              <UIFormInput
                {...field}
                placeholder="123456789012"
                maxLength={12}
                type="text"
              />
            )}
          />
          {errors.aadhaarNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber.message}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">12-digit Aadhaar number</p>
        </div>

        <div>
          <UIFormLabel>License Number (if applicable)</UIFormLabel>
          <Controller
            name="licenseNumber"
            control={control}
            render={({ field }) => (
              <UIFormInput {...field} placeholder="Enter professional license number" />
            )}
          />
          {errors.licenseNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
          disabled={loadingState}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-full"
          disabled={loadingState}
        >
          {loadingState ? (
            <>
              <LoadingSpinner /> Saving...
            </>
          ) : (
            "Continue to Qualifications"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddressIdentityForm;
