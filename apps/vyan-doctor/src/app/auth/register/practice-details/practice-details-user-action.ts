"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IPracticeDetailsProps {
  department: string;
  position: string;
  location: string;
  experience: string;
  sessionMode: string;
  listing: string;
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
  department: z.string().trim().min(1, "Department is required").max(120),
  position: z.string().trim().min(1, "Position is required").max(120),
  location: z.string().trim().min(1, "Location is required").max(200),
  // Bounded both ways: `parseInt` on junk yields NaN, and the years below are
  // derived by subtracting this from the current year — an unbounded value writes a
  // nonsensical or negative starting year onto the profile.
  experience: z.coerce
    .number({ invalid_type_error: "Enter years of experience as a number" })
    .int("Enter whole years of experience")
    .min(0, "Years of experience cannot be negative")
    .max(70, "Please enter a realistic number of years"),
  sessionMode: z.string().trim().min(1, "Please select a session mode").max(40),
  listing: z.string().trim().min(1, "Please select a listing type").max(40),
});

async function PracticeDetailsUserAction({
  department,
  position,
  location,
  experience,
  sessionMode,
  listing,
}: IPracticeDetailsProps): Promise<ActionResult> {
  const parsed = schema.safeParse({
    department,
    position,
    location,
    experience,
    sessionMode,
    listing,
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
    // Calculate startingYear and endingYear from experience
    const currentYear = new Date().getFullYear();
    const startingYear = (currentYear - parsed.data.experience).toString();
    const endingYear = currentYear.toString();

    // Upsert professional experience
    await db.professionalExperience.deleteMany({
      where: { professionalUserId: professionalUser.id },
    });

    await db.professionalExperience.create({
      data: {
        startingYear,
        endingYear,
        department: parsed.data.department,
        location: parsed.data.location,
        position: parsed.data.position,
        professionalUserId: professionalUser.id,
      },
    });

    // Update session mode and listing on user
    await db.professionalUser.update({
      data: {
        sessionMode: parsed.data.sessionMode,
        listing: parsed.data.listing,
      },
      where: {
        email: session.user.email,
      },
    });

    revalidatePath("/auth/register/practice-details");
    return {
      success: true,
      message: "Successfully saved practice details",
    };
  } catch (error) {
    console.error("Failed to save practice details:", error);
    return { success: false, error: "Failed to save practice details" };
  }
}

export default PracticeDetailsUserAction;
