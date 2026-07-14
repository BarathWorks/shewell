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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import Multiselect from "multiselect-react-dropdown";
import LoadingSpinner from "~/app/components/loading-spinner";
import PersonalInfoUserAction, { type ActionResult } from "./personal-info-user-action";
import { CustomisedCalendar } from "@repo/ui/src/@/components/customised-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/src/@/components/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/app/lib/utils";
import { Input } from "@repo/ui/src/@/components/input";
import Image from "next/image";
import uploadProfessionalUserImage from "~/(main)/upload-image-actions";
import React from "react";

interface ILanguageProps {
  id: string;
  name: string;
}

const personalInfoSchema = z.object({
  mediaId: z.string({ required_error: "Please upload a profile photo" }),
  firstName: z.string({ required_error: "Please enter the first name" }),
  lastName: z
    .string({ required_error: "Please enter the last name" })
    .optional(),
  dob: z.date({ required_error: "Please select the date of birth" }),
  phoneNumber: z
    .string({ required_error: "Please enter the phone number" })
    .max(10, { message: "Phone Number can have maximum 10 digits" })
    .regex(new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/), {
      message: "Please enter the correct phone number",
    }),
  gender: z.string({
    required_error: "Please select the Gender",
    invalid_type_error: "Please select the Gender",
  }),
  languages: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .min(1, { message: "Please select at least one language" }),
  aboutYou: z.string({
    required_error: "Please write about yourself",
    invalid_type_error: "Please write about yourself",
  }),
});

const PersonalInfoForm = ({
  languagesOptions,
  existingData,
  professionalUserId,
  fileUrl,
  defaultLanguages,
}: {
  languagesOptions: { id: string; name: string }[];
  existingData: {
    firstName: string;
    lastName: string | null;
    dob: Date | null;
    phoneNumber: string | null;
    gender: string | null;
    aboutYou: string | null;
    mediaId: string | null;
  } | null;
  professionalUserId: string;
  fileUrl: string | null;
  defaultLanguages: { id: string; name: string }[];
}) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof personalInfoSchema>>({
    defaultValues: {
      firstName: existingData?.firstName || "",
      lastName: existingData?.lastName || "",
      dob: existingData?.dob || undefined,
      phoneNumber: existingData?.phoneNumber || "",
      gender: existingData?.gender || "",
      aboutYou: existingData?.aboutYou || "",
      mediaId: existingData?.mediaId || undefined,
      languages: defaultLanguages,
    },
    resolver: zodResolver(personalInfoSchema),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(fileUrl || "");
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    params.set("step", "2");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  if (!session) {
    router.push("/auth/login");
  }

  const onSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    if (event.target.files.length > 0) {
      for (const image of event.target.files) {
        const arrayOfKeys = image.name.split(".");
        uploadProfessionalUserImage(
          professionalUserId,
          `professionalUser/${professionalUserId}/profile.${arrayOfKeys[arrayOfKeys.length - 1]}`,
          image.name,
          image.type,
        )
          .then(async (resp) => {
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": image.type,
              },
              body: image,
            };
            const res = await fetch(presignedUrl!, requestOptions);
            if (res.ok) {
              setValue("mediaId", id!);
              setImageUrl(fileUrl!);
            }
          })
          .catch((error) => {
            console.log("error while uploading image", error);
          });
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof personalInfoSchema>) => {
    setLoadingState(true);
    try {
      const resp = await PersonalInfoUserAction({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        languages: data.languages as any,
        aboutYou: data.aboutYou,
        mediaId: data.mediaId,
      });
      setLoadingState(false);
      if (resp.success) {
        toast({
          description: resp.message,
          variant: "default",
        });
        router.push(`/auth/register/address/?step=3`);
      } else {
        toast({
          description: resp.error,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setLoadingState(false);
      console.error("Personal info submission error:", err);
      toast({
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const errorHandler = (e: any) => {
    console.log("Form validation errors:", e);
    const firstErrorKey = Object.keys(e)[0];
    if (firstErrorKey) {
      const errorMessage =
        e[firstErrorKey]?.message ||
        `Please fill in the ${firstErrorKey} field`;
      toast({
        title: "Validation Error",
        description: String(errorMessage),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Personal Info</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {/* Upload Profile Photo */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Upload Your Photo*</UIFormLabel>
            <Controller
              control={control}
              name="mediaId"
              render={({ field }) => (
                <>
                  <Input
                    ref={fileInputRef}
                    onChange={onSelectImage}
                    type="file"
                    accept="image/*"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-teal file:text-white hover:file:brightness-95 border border-dashed border-[#c0c8cc] rounded-lg p-2 bg-[#f1f5f9] w-full cursor-pointer h-auto"
                  />
                  {errors && errors.mediaId && (
                    <p className="text-red-500 text-sm mt-1">{errors.mediaId.message}</p>
                  )}
                </>
              )}
            />
          </div>
          {imageUrl && (
            <div className="flex aspect-square w-[135px] items-center justify-center bg-[url('/images/doctor-bg.png')] bg-center bg-no-repeat">
              <div className="w-[116px]">
                <div className="relative aspect-square object-cover">
                  <Image
                    src={imageUrl}
                    alt="doctor-image"
                    className="rounded-full object-cover"
                    fill={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* First Name & Last Name */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-5">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">First Name*</UIFormLabel>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your first name"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Last Name</UIFormLabel>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your Last Name"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* DOB & Phone */}
          <div className="flex flex-col gap-6 md:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Date of Birth*</UIFormLabel>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "w-full py-3 px-4 text-left font-normal border-none bg-[#f1f5f9] rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-[#e2e8f0] hover:bg-[#e2e8f0] flex items-center justify-between h-auto",
                            !field.value && "text-slate-400",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-slate-400 font-sans text-sm">Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50 text-slate-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="center">
                        <CustomisedCalendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
                          className="w-full bg-white py-3"
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors && errors.dob && (
                      <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Phone Number*</UIFormLabel>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="tel"
                      placeholder="Enter your Phone Number"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Gender*</UIFormLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
                      <SelectValue placeholder="Select your gender" />
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Languages */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Languages*</UIFormLabel>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <>
                  <Multiselect
                    placeholder="Select Languages"
                    className="text-slate-900 font-sans"
                    options={languagesOptions}
                    selectedValues={field.value}
                    onSelect={(selectedList) => field.onChange(selectedList)}
                    onRemove={(selectedList) => field.onChange(selectedList)}
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
              )}
            />
          </div>

          {/* About You */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">About You*</UIFormLabel>
            <Controller
              control={control}
              name="aboutYou"
              render={({ field }) => (
                <>
                  <textarea
                    className="w-full rounded-lg border-none bg-[#f1f5f9] px-4 py-3 text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal min-h-[100px]"
                    placeholder="Write about yourself"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                  {errors && errors.aboutYou && (
                    <p className="text-red-500 text-sm mt-1">{errors.aboutYou.message}</p>
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

export default PersonalInfoForm;
