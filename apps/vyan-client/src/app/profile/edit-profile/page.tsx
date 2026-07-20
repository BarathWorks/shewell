"use server";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import ManagePasswordForm from "./manage-password-form";
import { db } from "~/server/db";
import { getServerSession } from "next-auth";
import PersonalInformationForm from "./personal-information-form";
import { User, KeyRound, ShieldCheck } from "lucide-react";

const EditProfile = async () => {
  const session = await getServerSession();
  const userDetails = await db.user.findFirst({
    select: {
      email: true,
      phoneNumber: true,
      name: true,
      passwordHash: true,
    },
    where: {
      email: session?.user?.email || "",
      deletedAt: null,
    },
  });

  return (
    <div className="w-full font-inter space-y-6">
      {/* Breadcrumbs */}
      <div className="pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-gray-500 hover:text-[#00898F]">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/profile/edit-profile" className="text-[#00898F] font-medium">
                Edit Profile
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Card Container */}
      <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Card Title Header */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4EE] text-[#00898F]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-xl font-semibold text-[#181818] md:text-2xl">
                Edit Profile Settings
              </h1>
              <p className="font-inter text-xs text-[#666666] mt-0.5">
                Manage your personal info, contact preferences, and password security.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div>
          <Tabs defaultValue="Personal Information" className="w-full">
            <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-2 rounded-2xl bg-gray-50 p-1.5 sm:w-fit">
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Personal Information"
              >
                <User className="h-4 w-4" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-poppins text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-[#00898F] data-[state=active]:text-white data-[state=active]:shadow-sm"
                value="Manage Password"
              >
                <KeyRound className="h-4 w-4" />
                Manage Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Personal Information" className="mt-0 focus-visible:outline-none">
              <PersonalInformationForm user={userDetails} />
            </TabsContent>

            <TabsContent value="Manage Password" className="mt-0 focus-visible:outline-none">
              <ManagePasswordForm email={userDetails?.email || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

