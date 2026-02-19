"use server";

import { getServerSession } from "next-auth";
import { db } from "~/server/db";

interface AddressIdentityData {
  countryId: string;
  stateId: string;
  city: string;
  completeAddress: string;
  pincode: string;
  panNumber: string | null;
  aadhaarNumber: string | null;
  licenseNumber: string | null;
}

export default async function AddressIdentityUserAction(data: AddressIdentityData) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized - Please login");
  }

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!professionalUser) {
    throw new Error("Professional user not found");
  }

  const professionalUserId = professionalUser.id;

  try {
    // Upsert Address
    await db.professionalAddress.upsert({
      where: { professionalUserId },
      create: {
        professionalUserId,
        countryId: data.countryId,
        stateId: data.stateId,
        city: data.city,
        completeAddress: data.completeAddress,
        pincode: data.pincode,
      },
      update: {
        countryId: data.countryId,
        stateId: data.stateId,
        city: data.city,
        completeAddress: data.completeAddress,
        pincode: data.pincode,
        updatedAt: new Date(),
      },
    });

    // Upsert Identity
    await db.professionalIdentity.upsert({
      where: { professionalUserId },
      create: {
        professionalUserId,
        panNumber: data.panNumber,
        aadhaarNumber: data.aadhaarNumber,
        licenseNumber: data.licenseNumber,
      },
      update: {
        panNumber: data.panNumber,
        aadhaarNumber: data.aadhaarNumber,
        licenseNumber: data.licenseNumber,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Address and identity details saved successfully",
    };
  } catch (error) {
    console.error("Error saving address/identity:", error);
    throw new Error("Failed to save details. Please try again.");
  }
}
