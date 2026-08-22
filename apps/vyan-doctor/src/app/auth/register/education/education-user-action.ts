"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IEducationProps {
  degree: string;
  collegeName: string;
  completionDate: string;
  displayedQualificationId: string;
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
  degree: z.string().trim().min(1, "Degree is required").max(120),
  collegeName: z.string().trim().min(1, "College or university is required").max(200),
  // `new Date("")` is Invalid Date, which Prisma then rejects at the driver with an
  // opaque error. Parsed here so the practitioner gets a sentence instead.
  completionDate: z.coerce
    .date({ invalid_type_error: "Please enter a valid completion date" })
    .max(new Date(), { message: "Completion date cannot be in the future" }),
  displayedQualificationId: z.string().trim().min(1, "Please choose a qualification to display"),
});

async function EducationUserAction({
  degree,
  collegeName,
  completionDate,
  displayedQualificationId,
}: IEducationProps): Promise<ActionResult> {
  const parsed = schema.safeParse({
    degree,
    collegeName,
    completionDate,
    displayedQualificationId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the details entered",
    };
  }

  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorised user" };
  }

  const professionalUser = await db.professionalUser.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!professionalUser) {
    return { success: false, error: "Professional User does not exist" };
  }

  try {
    await db.professionalDegree.deleteMany({
      where: { professionalUserId: professionalUser.id },
    });

    await db.professionalDegree.create({
      data: {
        degree: parsed.data.degree,
        collegeName: parsed.data.collegeName,
        completionDate: parsed.data.completionDate,
        professionalUserId: professionalUser.id,
      },
    });

    await db.professionalUser.update({
      data: { displayQualificationId: parsed.data.displayedQualificationId },
      where: { id: professionalUser.id },
    });

    revalidatePath("/auth/register/education");
    return {
      success: true,
      message: "Successfully saved education details",
    };
  } catch (error) {
    console.error("Failed to save education:", error);
    return { success: false, error: "Failed to save education details" };
  }
}

export default EducationUserAction;
