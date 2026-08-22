"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UIFormInput } from "~/components/ui/legacy-form";
import { UIFormLabel } from "~/components/ui/legacy-form";
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
import { format, subYears } from "date-fns";
import { cn } from "~/app/lib/utils";
import { Input } from "@repo/ui/src/@/components/input";
import Image from "next/image";
import uploadProfessionalUserImage from "~/(main)/upload-image-actions";
import React from "react";

interface ILanguageProps {
  id: string;
  name: string;
}

const MINIMUM_AGE_YEARS = 18;

const personalInfoSchema = z.object({
  mediaId: z.string({ required_error: "Please upload a profile photo" }),
  firstName: z.string({ required_error: "Please enter the first name" }),
  lastName: z
    .string({ required_error: "Please enter the last name" })
    .optional(),
  // Mirrors the server rule. The calendar already refused future dates, but
  // nothing enforced a minimum age, so a date of birth a fortnight ago was
  // accepted without complaint.
  dob: z
    .date({ required_error: "Please select the date of birth" })
    .max(subYears(new Date(), MINIMUM_AGE_YEARS), {
      message: `You must be at least ${MINIMUM_AGE_YEARS} years old`,
    })
    .min(new Date(1900, 0, 1), { message: "Please enter a valid date of birth" }),
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

  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  /**
   * Uploads the profile photo straight to S3 with a presigned URL.
   *
   * Every failure path here used to be silent: a non-OK response simply skipped
   * `setValue`, and the `.catch` only reached the console. Since `mediaId` is a
   * required field, the visible result was a form that refused to submit with
   * "Please upload a profile photo" next to a photo the practitioner had just
   * chosen — and no way to find out why. That is how the CSP blocking S3 went
   * unnoticed.
   */
  const onSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) return;

    setIsUploadingImage(true);
    try {
      const extension = image.name.split(".").pop() ?? "png";
      const { id, fileUrl, presignedUrl } = await uploadProfessionalUserImage(
        professionalUserId,
        `professionalUser/${professionalUserId}/profile.${extension}`,
        image.name,
        image.type,
      );

      if (!presignedUrl || !id) {
        throw new Error("The server did not return an upload URL.");
      }

      const res = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": image.type },
        body: image,
      });

      if (!res.ok) {
        throw new Error(`Storage rejected the file (${res.status}).`);
      }

      setValue("mediaId", id, { shouldValidate: true });
      setImageUrl(fileUrl!);
      toast({ description: "Photo uploaded", variant: "default" });
    } catch (error) {
      console.error("error while uploading image", error);
      toast({
        description:
          "We could not upload your photo. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
          {/* Upload Profile Photo */}
          <div>
            <UIFormLabel>Upload Your Photo*</UIFormLabel>
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
                  />
                  {errors && errors.mediaId && (
                    <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.mediaId.message}</p>
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
          <div className="flex flex-col gap-[18px] lg:flex-row lg:gap-5">
            <div className="w-full">
              <UIFormLabel>First Name*</UIFormLabel>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your first name"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                    {errors && errors.firstName && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="w-full">
              <UIFormLabel>Last Name</UIFormLabel>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="Enter your Last Name"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                    {errors && errors.lastName && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* DOB & Phone */}
          <div className="flex flex-col gap-4 md:flex-row xl:gap-6 ">
            <div className="w-full">
              <UIFormLabel>Date of Birth*</UIFormLabel>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full py-[24px] px-[12px] text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
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
                          // Future dates were already blocked, but nothing stopped
                          // a date of birth a few days ago — so a practitioner
                          // profile could claim an age of zero. The bound is the
                          // same one the schema and the server action enforce.
                          disabled={(date: Date) =>
                            date > subYears(new Date(), MINIMUM_AGE_YEARS) ||
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                          // Without this the picker opens on December of the last
                          // allowed year, where every day is past the cutoff and
                          // therefore disabled — it looks broken.
                          defaultMonth={
                            field.value ?? subYears(new Date(), MINIMUM_AGE_YEARS)
                          }
                          fromYear={1920}
                          toYear={new Date().getFullYear() - MINIMUM_AGE_YEARS}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors && errors.dob && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.dob.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="w-full">
              <UIFormLabel>Phone Number*</UIFormLabel>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="tel"
                      placeholder="Enter your Phone Number"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors && errors.phoneNumber && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">
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
            <UIFormLabel>Gender*</UIFormLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-md border border-solid border-hairline py-3 pl-4 font-inter text-sm font-normal outline-primary">
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
                    <p className="mt-1.5 text-xs font-medium text-danger-600">
                      {errors.gender.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Languages */}
          <div>
            <UIFormLabel>Languages*</UIFormLabel>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <>
                  <Multiselect
                    placeholder="Select"
                    className="text-black"
                    options={languagesOptions}
                    selectedValues={field.value}
                    onSelect={(selectedList) => field.onChange(selectedList)}
                    onRemove={(selectedList) => field.onChange(selectedList)}
                    displayValue="name"
                  />
                  {errors && errors.languages && (
                    <p className="mt-1.5 text-xs font-medium text-danger-600">
                      {errors.languages.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* About You */}
          <div>
            <UIFormLabel>About You*</UIFormLabel>
            <Controller
              control={control}
              name="aboutYou"
              render={({ field }) => (
                <>
                  <textarea
                    className="w-full rounded-md border border-border-color py-3 pl-4 outline-primary placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-placeholder-color"
                    placeholder="Write about yourself"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors && errors.aboutYou && (
                    <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.aboutYou.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:justify-between">
            <Button
              disabled={loadingState}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:w-auto"
              variant="OTP"
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Saving…" : "Next"}
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

export default PersonalInfoForm;
