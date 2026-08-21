"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface ILanguageProps {
  id: string;
  name: string;
}

interface IQualificationProps {
  degree: string;
  collegeName: string;
  completionDate: string;
  languages: ILanguageProps[];
  gender: string;
  department: string;
  position: string;
  location: string;
  displayedQualificationId: string;
  startingYear: string;
  endingYear: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function QualificationUserAction({
  degree,
  collegeName,
  completionDate,
  languages,
  gender,
  department,
  position,
  location,
  displayedQualificationId,
  startingYear,
  endingYear,
}: IQualificationProps): Promise<ActionResult> {
  try {
    const result = await db.$transaction(
      async (tx) => {
        const session = await getServerAuthSession();
        if (!session?.user?.email) {
          throw new Error("Unauthorised user");
        }

        const professionalUser = await tx.professionalUser.findUnique({
          where: {
            email: session.user.email,
          },
          select: {
            id: true,
          },
        });

        if (!professionalUser) {
          throw new Error("Professional User does not exist");
        }

        await tx.professionalDegree.deleteMany({
          where: {
            professionalUserId: professionalUser.id,
          },
        });

        await tx.professionalDegree.create({
          data: {
            degree: degree,
            collegeName: collegeName,
            completionDate: new Date(completionDate),
            professionalUserId: professionalUser.id,
          },
        });

        await tx.professionalUser.update({
          data: {
            displayQualificationId: displayedQualificationId,
            gender: gender,
          },
          where: {
            id: professionalUser.id,
          },
        });

        await tx.professionalExperience.deleteMany({
          where: {
            professionalUserId: professionalUser.id,
          },
        });

        await tx.professionalExperience.create({
          data: {
            startingYear: startingYear,
            endingYear: endingYear,
            department: department,
            location: location,
            position: position,
            professionalUserId: professionalUser.id,
          },
        });

        const languageConnect = languages.map((item) => ({
          id: item.id,
          language: item.name,
        }));

        await tx.professionalUser.update({
          where: {
            id: professionalUser.id,
          },
          data: {
            languages: {
              set: [],
            },
          },
        });

        await tx.professionalUser.update({
          where: {
            id: professionalUser.id,
          },
          data: {
            languages: {
              connect: languageConnect,
            },
          },
        });

        return {
          success: true,
          message: "Successfully submitted the Qualifications",
        };
      },
      {
        timeout: 70000,
      }
    );
    
    revalidatePath("/auth/register/qualifications");
    return result as ActionResult;
  } catch (error: any) {
    console.error("Qualification submission error:", error);
    return {
      success: false,
      error: error.message || "Failed to Submit the qualifications",
    };
  }
}

export default QualificationUserAction;
