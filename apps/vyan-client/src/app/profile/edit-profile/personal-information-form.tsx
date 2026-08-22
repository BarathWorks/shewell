"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/@/components/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";

import { toast, useToast } from "@repo/ui/src/@/components/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/src/@/components/alert-dialog";
// import EmailChangeForm from "./email-change-form";
import { useState } from "react";
import UpdatePersonalInfo, { emailChange } from "./personal-info-actions";
import EmailChangeForm from "./email-change-form";
type IUser = {
  name: string;
  email: string;
  phoneNumber: string;
} | null;
const infoFormSchema = z.object({
  name: z.string().min(3, "Name should contain min 3 char"),
  phoneNumber: z
    .string({ required_error: "Phone Number is required" })
    .max(10, { message: "Phone Number can have maximum 10 digits" })
    .regex(new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/), {
      message: "Phone number needs to be of 10 digit",
    }),
  email: z
    .string({ required_error: "Please enter the email" })
    .email({ message: "Please enter a valid Email address" })
    .regex(new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i), {
      message: "Invalid Email",
    }),
});
const PersonalInformationForm = ({ user }: { user: IUser }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof infoFormSchema>>({
    resolver: zodResolver(infoFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  const sendEmailChangeOtp = () => {
    emailChange()
      .then((resp) => {
        console.log(resp.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleClick = () => {
    sendEmailChangeOtp();
    setOpen(true);
  };

  const submitInfo = (data: IUser) => {
    return UpdatePersonalInfo(data)
      .then((resp) => {
        if (resp.error) {
          toast({
            title: resp.error,
            variant: "destructive",
          });
          console.log(resp.error);
        }
        if (resp.message) {
          toast({
            title: resp.message,
          });
          console.log(resp.message);
        }
      })
      .catch((err) => {
        toast({
          title: err.message,
          variant: "destructive",
        });
        console.log(err);
      })
      .finally(() => {});
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitInfo, (err) => console.log(err))}>
        <div className="flex flex-col justify-center border-t border-t-gray-100 pt-10 font-inter md:flex-row ">
          <div className="flex w-full flex-col gap-6 md:w-10/12 xl:gap-8">
            <div className="text-center font-inter text-sm font-normal text-muted">
              Make changes to your account here. Click save when you're done.
            </div>
            <div className="flex flex-col gap-6">
              <div className="w-full">
                <UIFormLabel className="font-poppins text-sm font-medium text-ink">
                  Name*
                </UIFormLabel>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormInput
                          type="text"
                          placeholder="eg. Jon Doe"
                          value={field.value}
                          onChange={field.onChange}
                          className="rounded-xl border-hairline bg-gray-50 font-inter focus:border-primary-600 focus:bg-white"
                        />
                        {errors && errors.name && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>

              <div className="w-full">
                <UIFormLabel className="font-poppins text-sm font-medium text-ink">
                  Phone Number *
                </UIFormLabel>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormInput
                          type="tel"
                          value={field.value}
                          placeholder="eg. +91-9778977898"
                          onChange={field.onChange}
                          disabled
                          className="rounded-xl border-hairline bg-gray-50 font-inter text-gray-500"
                        />
                        {errors && errors.phoneNumber && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.phoneNumber.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>

              <div className="w-full">
                <div className="flex justify-between">
                  <UIFormLabel className="font-poppins text-sm font-medium text-ink">
                    Email *
                  </UIFormLabel>
                  <div
                    onClick={handleClick}
                    className="cursor-pointer font-poppins text-sm font-medium text-primary-700 hover:underline"
                  >
                    Change email
                  </div>
                  {/* } */}
                </div>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <>
                        <UIFormInput
                          type="email"
                          placeholder="eg. appleseed@gmail.com"
                          value={field.value}
                          onChange={field.onChange}
                          disabled
                          className="rounded-xl border-hairline bg-gray-50 font-inter text-gray-500"
                        />
                        {errors && errors.email && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="mx-auto w-fit rounded-xl px-[49px] py-6 font-poppins text-base font-semibold shadow-[0_4px_14px_rgba(0,137,143,0.3)] hover:shadow-[0_6px_20px_rgba(0,137,143,0.4)]"
              variant="default"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="w-full rounded-md md:w-2/3 lg:max-w-[650px]">
          <AlertDialogCancel className="absolute right-5 top-4">
            <svg
              width="18"
              height="18"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.0612 18.9387C21.343 19.2205 21.5013 19.6027 21.5013 20.0012C21.5013 20.3997 21.343 20.7819 21.0612 21.0637C20.7794 21.3455 20.3972 21.5038 19.9987 21.5038C19.6002 21.5038 19.218 21.3455 18.9362 21.0637L10.9999 13.125L3.0612 21.0612C2.7794 21.343 2.39721 21.5013 1.9987 21.5013C1.60018 21.5013 1.21799 21.343 0.936196 21.0612C0.654403 20.7794 0.496094 20.3972 0.496094 19.9987C0.496094 19.6002 0.654403 19.218 0.936196 18.9362L8.87495 11L0.938695 3.06122C0.656903 2.77943 0.498594 2.39724 0.498594 1.99872C0.498594 1.60021 0.656903 1.21802 0.938695 0.936225C1.22049 0.654432 1.60268 0.496123 2.0012 0.496123C2.39971 0.496123 2.7819 0.654432 3.0637 0.936225L10.9999 8.87497L18.9387 0.934975C19.2205 0.653182 19.6027 0.494873 20.0012 0.494873C20.3997 0.494873 20.7819 0.653182 21.0637 0.934975C21.3455 1.21677 21.5038 1.59896 21.5038 1.99747C21.5038 2.39599 21.3455 2.77818 21.0637 3.05997L13.1249 11L21.0612 18.9387Z"
                fill="black"
                fill-opacity="0.4"
              />
            </svg>
          </AlertDialogCancel>
          <AlertDialogHeader className="flex flex-col space-y-4">
            <AlertDialogTitle className="flex justify-start">
              Changing the Email Id
            </AlertDialogTitle>
            <AlertDialogDescription className="mb-4 block text-left">
              An OTP (one time password) has been sent to your original mail id
              . Please verfiy the otp for successfuly changing the email id.
            </AlertDialogDescription>

            <EmailChangeForm />
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default PersonalInformationForm;
