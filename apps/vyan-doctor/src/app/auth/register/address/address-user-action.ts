"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IAddressProps {
  countryId: string;
  stateId: string;
  city: string;
  completeAddress: string;
  pincode: string;
}

export default async function AddressUserAction(data: IAddressProps) {
  const session = await getServerAuthSession();

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

    revalidatePath("/auth/register/address");
    return {
      success: true,
      message: "Address saved successfully",
    };
  } catch (error) {
    console.error("Error saving address:", error);
    throw new Error("Failed to save address. Please try again.");
  }
}
