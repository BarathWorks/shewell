import { db } from "~/server/db";
import { redirect } from "next/navigation";
import AddressForm from "./address-form";
import { getServerSession } from "next-auth";
import React from "react";

const AddressPage = async () => {
  const session = await getServerSession();

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

  // Fetch existing address data if any
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
    },
  });

  return (
    <>
      <AddressForm
        countries={countries}
        existingAddress={existingData?.address}
      />
    </>
  );
};

export default AddressPage;
