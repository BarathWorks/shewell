"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";

interface IEducationProps {
  degree: string;
  collegeName: string;
  completionDate: string;
  displayedQualificationId: string;
}

async function EducationUserAction({
  degree,
  collegeName,
  completionDate,
  displayedQualificationId,
}: IEducationProps) {
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
    await db.professionalDegree.deleteMany({
      where: { professionalUserId: professionalUser.id },
    });

    await db.professionalDegree.create({
      data: {
        degree,
        collegeName,
        completionDate: new Date(completionDate),
        professionalUserId: professionalUser.id,
      },
    });

    await db.professionalUser.update({
      data: { displayQualificationId: displayedQualificationId },
      where: { id: professionalUser.id },
    });

    revalidatePath("/auth/register/education");
    return {
      message: "Successfully saved education details",
    };
  } catch (error) {
    console.error("Failed to save education:", error);
    throw new Error("Failed to save education details");
  }
}

export default EducationUserAction;
