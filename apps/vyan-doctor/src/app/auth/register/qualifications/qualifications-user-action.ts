"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { StringifyOptions } from "querystring";
import { db } from "~/server/db";

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
}: IQualificationProps) {
  return db.$transaction(
    async (tx) => {
      const session = await getServerSession();
      console.log("sessionq", session);
      if (!session?.user) {
        throw new Error("Unauthorised user");
      }

      const professionalUser = await tx.professionalUser.findUnique({
        where: {
          email: session.user.email!,
        },
        select: {
          id: true,
        },
      });
      if (!professionalUser) {
        return {
          message: "Professional User do not exist",
        };
      }

      console.log(
        "displayedQualificationIddisplayedQualificationId",
        displayedQualificationId,
      );

      try {
        await tx.professionalDegree.deleteMany({
          where: {
            professionalUserId: professionalUser.id,
          },
        });
        await tx.professionalDegree.createMany({
          data: {
            degree: degree,
            collegeName: collegeName,
            completionDate: new Date(completionDate),
            professionalUserId: professionalUser?.id!,
          },
        });
        await tx.professionalUser.update({
          data: {
            displayQualificationId: displayedQualificationId,
          },
          where: {
            id: professionalUser.id,
          },
        });

        await tx.professionalExperience.deleteMany({
          where: {
            professionalUserId: professionalUser.id!,
          },
        });
        await tx.professionalExperience.create({
          data: {
            startingYear: startingYear,
            endingYear: endingYear,
            department: department,
            location: location,
            position: position,
            professionalUserId: professionalUser?.id,
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
        await tx.professionalUser.update({
          data: {
            gender: gender,
          },
          where: {
            email: session.user.email!,
          },
        });
        revalidatePath("/auth/register/qualifications");
        return {
          message: "Successfully submitted the Qualifications",
        };
      } catch (error) {
        console.log("qualificationError", error);
        console.error("Failed to Submit the qualifications");
        throw new Error("Failed to Submit the qualifications");
      }
    },
    {
      timeout: 70000,
    },
  );
}
export default QualificationUserAction;
