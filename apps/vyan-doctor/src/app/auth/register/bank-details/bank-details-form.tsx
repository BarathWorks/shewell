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
  bankUpiId: z.string().optional(),
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
  bankUpiId,
}: {
  professionalUserId: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  bankIfscCode: string;
  bankUpiId: string;
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
      bankUpiId,
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
    params.set("step", "5");
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
      bankUpiId: data.bankUpiId,
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit, errorHandler)}
        noValidate={true}
        className="rounded-md border-2 border-primary p-4 md:p-6 "
      >
        <div className="flex flex-col gap-[18px] md:gap-5 xl:gap-6 ">
          {/* Account Holder Name */}
          <div>
            <UIFormLabel>Account Holder Name</UIFormLabel>
            <Controller
              control={control}
              name="bankAccountHolderName"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      placeholder="Enter account holder name"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors && errors.bankAccountHolderName && (
                      <p className="text-red-500">
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
            <UIFormLabel>Account Number</UIFormLabel>
            <Controller
              control={control}
              name="bankAccountNumber"
              render={({ field }) => {
                return (
                  <>
                    <UIFormInput
                      placeholder="Enter account number"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors && errors.bankAccountNumber && (
                      <p className="text-red-500">
                        {errors.bankAccountNumber.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Bank Name & Branch */}
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel>Bank Name</UIFormLabel>
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="Enter bank name"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {errors && errors.bankName && (
                        <p className="text-red-500">
                          {errors.bankName.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
            <div className="w-full">
              <UIFormLabel>Branch Name</UIFormLabel>
              <Controller
                control={control}
                name="bankBranch"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="Enter branch name"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {errors && errors.bankBranch && (
                        <p className="text-red-500">
                          {errors.bankBranch.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          {/* IFSC Code & UPI ID */}
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
            <div className="w-full">
              <UIFormLabel>IFSC Code</UIFormLabel>
              <Controller
                control={control}
                name="bankIfscCode"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="e.g. SBIN0001234"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {errors && errors.bankIfscCode && (
                        <p className="text-red-500">
                          {errors.bankIfscCode.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
            <div className="w-full">
              <UIFormLabel>UPI ID (Optional)</UIFormLabel>
              <Controller
                control={control}
                name="bankUpiId"
                render={({ field }) => {
                  return (
                    <>
                      <UIFormInput
                        placeholder="e.g. name@upi"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {errors && errors.bankUpiId && (
                        <p className="text-red-500">
                          {errors.bankUpiId.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>
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
                      <div className="font-poppins font-normal text-base text-black-300">
                        Have you read{" "}
                        <Link href="/terms" className="underline">
                          Terms and Conditions
                        </Link>{" "}
                        ?
                      </div>
                    </div>
                    {errors && errors.termsAndConditions && (
                      <p className="text-red-500">
                        {errors.termsAndConditions.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 ">
            <Button
              disabled={loadingState}
              className="w-[260px] sm:w-[325px]"
              variant="OTP"
              type="submit"
              onClick={() => {
                handleSubmit(onSubmit, errorHandler);
              }}
            >
              {loadingState && <LoadingSpinner width="20" height="20" />}
              {loadingState ? "Loading..." : " Register"}
            </Button>
            <div className=" font-inter text-base font-normal">
              Already have a account?{" "}
              <Link
                className="ml-3 font-poppins text-base  font-medium text-primary"
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

export default BankDetailsForm;
