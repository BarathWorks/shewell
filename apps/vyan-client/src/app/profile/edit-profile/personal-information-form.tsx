"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/@/components/button";
import { Label } from "@repo/ui/src/@/components/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import AddFormInput from "~/components/address-form-input";

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
import UpdatePersonalInfo, { emailChange, } from "./personal-info-actions";
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
        <div className="flex flex-col justify-center border-t-2 border-t-[#F2F7EA] pt-10 font-inter md:flex-row ">
          <div className="flex w-10/12 flex-col gap-5 md:gap-6 xl:gap-[30px] 2xl:gap-8">
            <div className="text-center text-sm font-normal text-active">
              Make changes to your account here. Click save when you're done.
            </div>
            <div className="flex flex-col gap-3 md:gap-4 xl:gap-5 2xl:gap-6">
              <div className="w-full">
                <Label>Name*</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <>
                        <AddFormInput
                          type="text"
                          placeholder="eg. Jon Doe"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {errors && errors.name && (
                          <p className="text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </>
                    );
                  }}
                />
              </div>

              <div className="w-full">
                <Label>Phone Number *</Label>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => {
                    return (
                      <>
                        <AddFormInput
                          type="tel"
                          value={field.value}
                          placeholder="eg. +91-9778977898"
                          onChange={field.onChange}
                          disabled
                        />
                        {errors && errors.phoneNumber && (
                          <p className="text-sm text-red-500">
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
                  <Label>Email *</Label>
                  <div
                    onClick={handleClick}
                    className="cursor-pointer text-sm font-medium text-primary underline"
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
                        <AddFormInput
                          type="email"
                          placeholder="eg. appleseed@gmail.com"
                          value={field.value}
                          onChange={field.onChange}
                          disabled
                        />
                        {errors && errors.email && (
                          <p className="text-sm text-red-500">
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
              className="mx-auto w-fit bg-primary px-[49px] py-2 font-inter text-[14px] font-medium leading-6 shadow-[2px_2px_4px_0px_rgba(64,64,64,0.4)] hover:bg-primary"
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
