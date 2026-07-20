"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/src/@/components/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import UIFormInput from "@repo/ui/src/@/components/form/input";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/src/@/components/alert-dialog";
import UpdatePersonalInfo, { emailChange } from "./personal-info-actions";
import EmailChangeForm from "./email-change-form";
import ProfileAvatarUpload from "./profile-avatar-upload";
import { CheckCircle2, Loader2, Mail, Phone, ShieldCheck, X } from "lucide-react";

type IUser = {
  name: string;
  email: string;
  phoneNumber: string;
} | null;

const infoFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
});

const PersonalInformationForm = ({ user }: { user: IUser }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    control,
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

  const handleEmailChangeClick = async () => {
    try {
      await emailChange();
      setOpen(true);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your current email address.",
      });
    } catch (err) {
      toast({
        title: "Failed to send OTP",
        description: "Could not send email change instructions.",
        variant: "destructive",
      });
    }
  };

  const submitInfo = async (data: z.infer<typeof infoFormSchema>) => {
    setIsSubmitting(true);
    try {
      const resp = await UpdatePersonalInfo({
        name: data.name,
        email: user?.email || data.email,
        phoneNumber: user?.phoneNumber || data.phoneNumber || "",
      });

      if (resp.error) {
        toast({
          title: "Update Failed",
          description: resp.error,
          variant: "destructive",
        });
      } else if (resp.message) {
        toast({
          title: "Profile Updated",
          description: resp.message,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 pt-6 font-inter">
        {/* Profile Avatar Section */}
        <ProfileAvatarUpload name={user?.name || ""} />

        <form onSubmit={handleSubmit(submitInfo)}>
          <div className="flex flex-col gap-6">
            <div className="text-sm text-[#666666]">
              Update your personal account details below. Click save changes when complete.
            </div>

            {/* Name Field */}
            <div className="w-full">
              <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
                Full Name *
              </UIFormLabel>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <>
                    <UIFormInput
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-1.5 rounded-xl border-gray-200 bg-gray-50 font-inter focus:border-[#00898F] focus:bg-white"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Phone Number Field */}
            <div className="w-full">
              <div className="flex items-center justify-between">
                <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
                  Phone Number *
                </UIFormLabel>
                <span className="inline-flex items-center gap-1 font-inter text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              </div>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field }) => (
                  <>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <UIFormInput
                        type="tel"
                        value={field.value}
                        placeholder="e.g. +91-9876543210"
                        disabled
                        className="pl-10 rounded-xl border-gray-200 bg-gray-100/70 font-inter text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </>
                )}
              />
            </div>

            {/* Email Field */}
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UIFormLabel className="font-poppins text-sm font-medium text-[#333333]">
                    Email Address *
                  </UIFormLabel>
                  <span className="inline-flex items-center gap-1 font-inter text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleEmailChangeClick}
                  className="font-poppins text-xs font-medium text-[#00898F] hover:underline"
                >
                  Change email
                </button>
              </div>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <UIFormInput
                        type="email"
                        placeholder="e.g. user@example.com"
                        value={field.value}
                        disabled
                        className="pl-10 rounded-xl border-gray-200 bg-gray-100/70 font-inter text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </>
                )}
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-start">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#00898F] px-8 py-3.5 font-poppins text-base font-semibold text-white shadow-[0_4px_14px_rgba(0,137,143,0.3)] transition-all hover:bg-[#007277] hover:shadow-[0_6px_20px_rgba(0,137,143,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Email Change Modal */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="w-full max-w-[550px] rounded-2xl p-6 sm:p-8">
          <AlertDialogCancel
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 border-none p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins text-xl font-semibold text-[#181818]">
              Change Email Address
            </AlertDialogTitle>
            <AlertDialogDescription className="font-inter text-xs text-[#666666]">
              An OTP has been dispatched to your current email address. Please enter the OTP and your new email address to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <EmailChangeForm onSuccess={() => setOpen(false)} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PersonalInformationForm;

