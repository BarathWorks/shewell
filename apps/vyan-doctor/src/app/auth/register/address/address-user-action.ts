"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IAddressProps {
  countryId: string;
  stateId: string;
  city: string;
  completeAddress: string;
  pincode: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server-side validation — a Server Action is an HTTP endpoint, so the matching
 * form's zod schema is a convenience for the person filling it in, not a
 * constraint. This step trusted its input completely.
 */
const schema = z.object({
  countryId: z.string().trim().min(1, "Country is required"),
  stateId: z.string().trim().min(1, "State is required"),
  city: z.string().trim().min(1, "City is required").max(100),
  completeAddress: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(500),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
});

/**
 * Saves the practice address.
 *
 * Returns failures rather than throwing, matching every other step in this wizard.
 * Next.js replaces the message of an error thrown out of a Server Action with a
 * generic string in production builds, so "Unauthorized - Please login" reached
 * the practitioner as "An unexpected error occurred" — on the one step where the
 * likely cause is an expired session and the fix is to sign in again.
 */
export default async function AddressUserAction(
  data: IAddressProps,
): Promise<ActionResult> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the details entered",
    };
  }
  data = parsed.data;

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
    return { success: false, error: "Failed to save address. Please try again." };
  }
}
