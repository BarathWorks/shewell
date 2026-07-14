"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import ModesUserAction from "./modes-user-action";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";

const modeSchema = z.object({
  sessionMode: z.string({
    required_error: "Please select the Session Mode",
    invalid_type_error: "Please select the Session Mode",
  }),
  // sessionType: z.string({
  //   required_error: "Please select the Session Type",
  //   invalid_type_error: "Please select the Session Type",
  // }).optional(),
  // meetingType: z.string({
  //   required_error: "Please select the Meeting Type ",
  //   invalid_type_error: "Please select the Meeting Type",
  // }).optional(),
  listing: z.string({
    required_error: "Please select the Listing Type ",
    invalid_type_error: "Please select the Listing Type",
  }),
  // issues: z.string({ required_error: "Please select the Issue" }),
});

const ModesForm = ({
  sessionMode,
  // sessionType,
  // meetingType,
  listing,
}: {
  sessionMode: string;
  // sessionType: string;
  // meetingType: string;
  listing: string;
}) => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<z.infer<typeof modeSchema>>({
    defaultValues: {
      sessionMode: sessionMode,
      // sessionType: sessionType,
      // meetingType: "google-meet",
      listing: listing,
    },
    resolver: zodResolver(modeSchema),
  });
  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  if (!session) {
    router.push("/auth/login");
  }
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const pathname = usePathname();
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  params.set("step", "4")

  useEffect(() => {

    params.set("step", "4")
    window.history.pushState(null, "", `${pathname}?${params.toString()}`)
  }, [])

  const onSubmit = (data: z.infer<typeof modeSchema>) => {
    setLoadingState(true);
    // console.log(data);

    ModesUserAction(data as { sessionMode: string; listing: string })
      .then((resp) => {
        setLoadingState(false);
        console.log("uploads", resp?.message);
        toast({
          description: "Successfull Added the modes",
          variant: "default",
        });
        router.push(`/auth/register/uploads/?step=5`);
      })
      .catch((err) => {
        setLoadingState(false);
        toast({
          description: err.message,
          variant: "destructive",
        });
        console.log(err);
      });
  };
  const errorHandler = (e: any) => {
    console.log(e);
  };
  // const { data: session } = useSession();
  // console.log("session", session);
  // if (!session?.user) {
  //   console.log("unauthorised");
  //   redirect("/auth/login");
  // }

  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Modes</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Session Mode</UIFormLabel>
            <Controller
              control={control}
              name="sessionMode"
              render={({ field }) => {
                return (
                  <>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={sessionMode || ""}
                    >
                      <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
                        <SelectValue placeholder="Select the Session Mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors && errors.sessionMode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.sessionMode.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-6 xl:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">To Be Listed As</UIFormLabel>
              <Controller
                control={control}
                name="listing"
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={listing || ""}
                      >
                        <SelectTrigger className="w-full rounded-lg border-none bg-[#f1f5f9] py-3 pl-4 pr-10 font-sans text-sm font-normal text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal h-auto">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Clinical">Clinical</SelectItem>
                          <SelectItem value="Non Clinical">
                            Non Clinical
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors && errors.listing && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.listing.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
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
      <div className="mt-8 border-t pt-4">
        <div className="mb-2 font-sans text-xs text-slate-500">
          By proceeding, you agree to the{" "}
          <Link
            href="#"
            className="text-brand-teal hover:underline"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="text-brand-teal hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-sans">
          <Link className="hover:text-slate-600" href={""}>Help</Link>
          <Link className="hover:text-slate-600" href={""}>Privacy</Link>
          <Link className="hover:text-slate-600" href={""}>Terms</Link>
        </div>
      </div>
    </div>)
};

export default ModesForm;
