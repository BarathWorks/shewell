"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";

interface IPracticeDetailsProps {
  department: string;
  position: string;
  location: string;
  startingYear: string;
  endingYear: string;
  sessionMode: string;
  listing: string;
}

async function PracticeDetailsUserAction({
  department,
  position,
  location,
  startingYear,
  endingYear,
  sessionMode,
  listing,
}: IPracticeDetailsProps) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorised user");
  }

  const professionalUser = await db.professionalUser.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!professionalUser) {
    throw new Error("Professional User does not exist");
  }

  try {
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
      message: "Successfully saved practice details",
    };
  } catch (error) {
    console.error("Failed to save practice details:", error);
    throw new Error("Failed to save practice details");
  }
}

export default PracticeDetailsUserAction;
