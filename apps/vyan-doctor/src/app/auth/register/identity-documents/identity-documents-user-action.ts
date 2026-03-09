"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";

interface IIdentityDocumentsProps {
  panNumber?: string;
  aadhaarNumber?: string;
  licenseNumber?: string;
}

export default async function IdentityDocumentsUserAction(
  data: IIdentityDocumentsProps,
) {
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
    await db.professionalIdentity.upsert({
      where: { professionalUserId },
      create: {
        professionalUserId,
        panNumber: data.panNumber || null,
        aadhaarNumber: data.aadhaarNumber || null,
        licenseNumber: data.licenseNumber || null,
      },
      update: {
        panNumber: data.panNumber || null,
        aadhaarNumber: data.aadhaarNumber || null,
        licenseNumber: data.licenseNumber || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/auth/register/identity-documents");
    return {
      success: true,
      message: "Identity documents saved successfully",
    };
  } catch (error) {
    console.error("Error saving identity documents:", error);
    throw new Error("Failed to save identity documents. Please try again.");
  }
}
