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
import EducationUserAction from "./education-user-action";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import LoadingSpinner from "~/app/components/loading-spinner";

interface ISpecialization {
  value: string;
  label: string;
}

const educationSchema = z.object({
  degree: z.string({ required_error: "Please enter the degree" }),
  collegeName: z.string({ required_error: "Please enter the college name" }),
  completionDate: z.string({
    required_error: "Please enter the completion date",
  }),
  displayedQualificationId: z.string({
    required_error: "Please select the displayed qualification",
    invalid_type_error: "Please select the displayed qualification",
  }),
});

const EducationForm = ({
  specialisations,
  degree,
  collegeName,
  completionDate,
  displayQualificationId,
}: {
  specialisations: ISpecialization[];
  degree: string;
  collegeName: string;
  completionDate: string;
  displayQualificationId: string;
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof educationSchema>>({
    defaultValues: {
      degree: degree || "",
      collegeName: collegeName || "",
      completionDate: completionDate || "",
      displayedQualificationId: displayQualificationId || "",
    },
    resolver: zodResolver(educationSchema),
  });

  const [loadingState, setLoadingState] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    params.set("step", "5");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  if (!session) {
    router.push("/auth/login");
  }

  const onSubmit = async (data: z.infer<typeof educationSchema>) => {
    setLoadingState(true);
    EducationUserAction({
      degree: data.degree,
      collegeName: data.collegeName,
      completionDate: data.completionDate,
      displayedQualificationId: data.displayedQualificationId,
    })
      .then((resp) => {
        setLoadingState(false);
        // These actions report failure by RETURNING `{ success: false, error }`
        // rather than throwing, so the `.catch` below never sees it. Without this
        // check a failed save showed a success toast and advanced to the next
        // registration step, silently discarding what the practitioner entered.
        if (!resp?.success) {
          toast({
            title: "Could not save",
            description: resp?.error ?? "Please try again",
            variant: "destructive",
          });
          return;
        }

        toast({
          description: resp?.message,
          variant: "default",
        });
        router.push(`/auth/register/practice-details/?step=6`);
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6">
          {/* Degree */}
          <div>
            <UIFormLabel>Designation or Degree*</UIFormLabel>
            <Controller
              name="degree"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    className="placeholder:text-black"
                    placeholder="Enter your Degree"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  {errors?.degree && (
                    <p className="mt-1.5 text-xs font-medium text-danger-600">
                      {errors.degree.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* College & Completion Date */}
          <div className="flex flex-col gap-4 lg:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel>College/University Name*</UIFormLabel>
              <Controller
                name="collegeName"
                control={control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      className="placeholder:text-black"
                      placeholder="Enter college or university name"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    {errors?.collegeName && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">
                        {errors.collegeName.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="w-full">
              <UIFormLabel>Completion Date*</UIFormLabel>
              <Controller
                name="completionDate"
                control={control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="date"
                      className="placeholder:text-black"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {errors?.completionDate && (
                      <p className="mt-1.5 text-xs font-medium text-danger-600">
                        {errors.completionDate.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Displayed Qualification */}
          <div>
            <UIFormLabel>Qualification to be displayed as*</UIFormLabel>
            <Controller
              control={control}
              name="displayedQualificationId"
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-md border border-solid border-hairline py-3 pl-4 font-inter text-sm font-normal outline-primary">
                      <SelectValue placeholder="Qualification to be displayed as" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        {specialisations &&
                          specialisations.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.displayedQualificationId && (
                    <p className="mt-1.5 text-xs font-medium text-danger-600">
                      {errors.displayedQualificationId.message}
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
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:w-auto"
              variant="OTP"
              type="submit"
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Saving…" : "Next"}
            </Button>
            <div className=" font-inter text-base font-normal">
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

export default EducationForm;
