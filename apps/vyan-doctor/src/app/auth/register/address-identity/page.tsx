import { db } from "~/server/db";
import { redirect } from "next/navigation";
import AddressIdentityForm from "./address-identity-form";
import React from "react";
import { getServerAuthSession } from "~/server/auth";

const AddressIdentityPage = async () => {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Fetch active countries
  const countries = await db.country.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch existing data if any
  const existingData = await db.professionalUser.findFirst({
    where: { email: session.user.email },
    include: {
      address: {
        select: {
          countryId: true,
          stateId: true,
          city: true,
          completeAddress: true,
          pincode: true,
        },
      },
      identity: true,
    },
  });

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-4xl p-6">
        <AddressIdentityForm
          countries={countries}
          existingAddress={existingData?.address}
          existingIdentity={existingData?.identity}
        />
      </div>
    </div>
  );
};

export default AddressIdentityPage;
