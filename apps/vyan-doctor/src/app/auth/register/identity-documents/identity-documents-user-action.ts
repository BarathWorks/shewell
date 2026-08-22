"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

/**
 * Server-side validation — a Server Action is an HTTP endpoint, so the matching
 * form's zod schema is a convenience for the person filling it in, not a
 * constraint. This step trusted its input completely.
 */
const optionalText = (schema: z.ZodString) =>
  schema.optional().or(z.literal("")).transform((v) => v || undefined);

const schema = z.object({
  panNumber: optionalText(
    z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN format: ABCDE1234F"),
  ),
  aadhaarNumber: optionalText(
    z.string().trim().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  ),
  licenseNumber: optionalText(z.string().trim().max(60)),
});

export default async function IdentityDocumentsUserAction(
  data: IIdentityDocumentsProps,
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
