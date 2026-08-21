"use server";

import { revalidatePath } from "next/cache";
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

async function EducationUserAction({
  degree,
  collegeName,
  completionDate,
  displayedQualificationId,
}: IEducationProps): Promise<ActionResult> {
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
      success: true,
      message: "Successfully saved education details",
    };
  } catch (error) {
    console.error("Failed to save education:", error);
    return { success: false, error: "Failed to save education details" };
  }
}

export default EducationUserAction;
