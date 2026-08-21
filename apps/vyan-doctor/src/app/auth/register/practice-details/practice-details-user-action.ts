"use server";

import { revalidatePath } from "next/cache";
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

async function PracticeDetailsUserAction({
  department,
  position,
  location,
  experience,
  sessionMode,
  listing,
}: IPracticeDetailsProps): Promise<ActionResult> {
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
    const yearsOfExperience = parseInt(experience);
    const startingYear = (currentYear - yearsOfExperience).toString();
    const endingYear = currentYear.toString();

    // Upsert professional experience
    await db.professionalExperience.deleteMany({
      where: { professionalUserId: professionalUser.id },
    });

    await db.professionalExperience.create({
      data: {
        startingYear,
        endingYear,
        department,
        location,
        position,
        professionalUserId: professionalUser.id,
      },
    });

    // Update session mode and listing on user
    await db.professionalUser.update({
      data: {
        sessionMode,
        listing,
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
