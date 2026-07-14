"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@repo/ui/src/@/components/button";
import Link from "next/link";
import BankDetailsUserAction from "./bank-details-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/app/components/loading-spinner";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";

const bankDetailsSchema = z.object({
  bankAccountHolderName: z
    .string({ required_error: "Please enter account holder name" })
    .min(1, "Please enter account holder name"),
  bankAccountNumber: z
    .string({ required_error: "Please enter account number" })
    .min(1, "Please enter account number"),
  bankName: z
    .string({ required_error: "Please enter bank name" })
    .min(1, "Please enter bank name"),
  bankBranch: z
    .string({ required_error: "Please enter branch name" })
    .min(1, "Please enter branch name"),
  bankIfscCode: z
    .string({ required_error: "Please enter IFSC code" })
    .min(1, "Please enter IFSC code")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format (e.g. SBIN0001234)"),
  termsAndConditions: z.literal(true, {
    errorMap: () => ({
      message: "You must read terms and conditions before submitting the details",
    }),
  }),
});

const BankDetailsForm = ({
  professionalUserId,
  bankAccountHolderName,
  bankAccountNumber,
  bankName,
  bankBranch,
  bankIfscCode,
}: {
  professionalUserId: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  bankIfscCode: string;
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof bankDetailsSchema>>({
    defaultValues: {
      bankAccountHolderName,
      bankAccountNumber,
      bankName,
      bankBranch,
      bankIfscCode,
    },
    resolver: zodResolver(bankDetailsSchema),
  });

  const { toast } = useToast();
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const router = useRouter();
  const session = useSession();

  if (!session) {
    router.push("/auth/login");
  }

  useEffect(() => {
    params.set("step", "7");
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }, []);

  const onSubmit = (data: z.infer<typeof bankDetailsSchema>) => {
    setLoadingState(true);
    console.log(data);
    BankDetailsUserAction({
      bankAccountHolderName: data.bankAccountHolderName,
      bankAccountNumber: data.bankAccountNumber,
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      bankIfscCode: data.bankIfscCode,
    })
      .then((resp) => {
        setLoadingState(false);
        console.log("BankDetails", resp?.message);
        toast({
          title: "Successfully Registered",
          variant: "default",
        });
        router.push("/doctor-profile");
      })
      .catch((err) => {
        setLoadingState(false);
        console.log(err);
        toast({
          title: "Can not register",
          variant: "destructive",
        });
      });
  };

  const errorHandler = (e: any) => {
    console.log(e);
  };

  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Bank Details</h3>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
          {/* Account Holder Name */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Account Holder Name</UIFormLabel>
            <Controller
              control={control}
              name="bankAccountHolderName"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      placeholder="Enter account holder name"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.bankAccountHolderName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bankAccountHolderName.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Account Number */}
          <div>
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Account Number</UIFormLabel>
            <Controller
              control={control}
              name="bankAccountNumber"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      placeholder="Enter account number"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.bankAccountNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bankAccountNumber.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Bank Name & Branch */}
          <div className="flex flex-col gap-6 xl:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Bank Name</UIFormLabel>
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="Enter bank name"
                        value={field.value || ""}
                        onChange={field.onChange}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.bankName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bankName.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
            <div className="w-full">
              <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">Branch Name</UIFormLabel>
              <Controller
                control={control}
                name="bankBranch"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="Enter branch name"
                        value={field.value || ""}
                        onChange={field.onChange}
                        style={{ border: "none" }}
                        className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                      />
                      {errors && errors.bankBranch && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bankBranch.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          {/* IFSC Code */}
          <div className="w-full">
            <UIFormLabel className="block text-sm font-medium text-slate-700 font-sans">IFSC Code</UIFormLabel>
            <Controller
              control={control}
              name="bankIfscCode"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      placeholder="e.g. IFSC0001234"
                      value={field.value || ""}
                      onChange={field.onChange}
                      style={{ border: "none" }}
                      className="w-full px-4 py-3 rounded-lg bg-[#f1f5f9] placeholder:text-slate-400 placeholder:font-sans text-slate-900 focus:bg-[#e2e8f0] focus:ring-0 focus:outline-none focus:outline-2 focus:outline-brand-teal"
                    />
                    {errors && errors.bankIfscCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bankIfscCode.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <Controller
              name="termsAndConditions"
              control={control}
              render={({ field }) => {
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <div className="font-sans font-normal text-sm text-slate-600">
                        Have you read{" "}
                        <Link href="/terms" className="underline text-brand-teal font-medium hover:brightness-95">
                          Terms and Conditions
                        </Link>{" "}
                        ?
                      </div>
                    </div>
                    {errors && errors.termsAndConditions && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.termsAndConditions.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

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
              {loadingState ? "Loading..." : "Register"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BankDetailsForm;
