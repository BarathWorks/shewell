"use server";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/src/@/components/breadcrumb";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import AddressPopUp from "./address-popup";
import { MapPin } from "lucide-react";

export default async function ManageAddress() {
  const session = await getServerSession();
  const userDetails = await db.user.findUnique({
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      name: true,
    },
    where: {
      email: session?.user?.email || "",
    },
  });

  const countries = await db.country.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      active: true,
    },
  });

  const addedAddresses = await db.address.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      houseNo: true,
      area: true,
      mobile: true,
      landmark: true,
      pincode: true,
      addressType: true,
      countryId: true,
      stateId: true,
    },
    where: {
      userId: userDetails?.id || "",
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
              <BreadcrumbLink href="/profile/manage-address" className="text-[#00898F] font-medium">
                Manage Addresses
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
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-poppins text-xl font-semibold text-[#181818] md:text-2xl">
                Manage Saved Addresses
              </h1>
              <p className="font-inter text-xs text-[#666666] mt-0.5">
                Add and manage your delivery addresses for fast and seamless checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Address Cards List & Add Button */}
        <div className="grid grid-cols-1 gap-y-6">
          <AddressPopUp
            addedAddresses={addedAddresses}
            countries={countries}
          />
        </div>
      </div>
    </div>
  );
}

