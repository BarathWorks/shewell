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
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Education</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {/* Degree */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Designation or Degree*</UIFormLabel>
            <Controller
              name="degree"
              control={control}
              render={({ field }) => (
                <>
                  <UIFormInput
                    placeholder="Enter your Degree"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    style={{ border: "none" }}
                    className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                  />
                  {errors?.degree && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.degree.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* College & Completion Date */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-5">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">College/University Name*</UIFormLabel>
              <Controller
                name="collegeName"
                control={control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      placeholder="Enter college or university name"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors?.collegeName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.collegeName.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Completion Date*</UIFormLabel>
              <Controller
                name="completionDate"
                control={control}
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="date"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors?.completionDate && (
                      <p className="text-red-500 text-sm mt-1">
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
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Qualification to be displayed as*</UIFormLabel>
            <Controller
              control={control}
              name="displayedQualificationId"
              render={({ field }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.displayedQualificationId.message}
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

export default EducationForm;
