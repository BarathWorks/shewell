"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IIdentityDocumentsProps {
  panNumber?: string;
  aadhaarNumber?: string;
  licenseNumber?: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export default async function IdentityDocumentsUserAction(
  data: IIdentityDocumentsProps,
): Promise<ActionResult> {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized - Please login" };
  }

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!professionalUser) {
    return { success: false, error: "Professional user not found" };
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
    return { success: false, error: "Failed to save identity documents. Please try again." };
  }
}
