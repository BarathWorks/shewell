"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
export interface IDegree {
  // id: string;
  degree: string;
}

export interface IExperience {
  // id: string;
  // years: string;
  startingYear : string;
  endingYear : string;
  position: string;
  department: string;
  location: string;
}
export interface IQualification {
  education: string;
  degrees: IDegree[];
  experiences: IExperience[];
}
async function EditQualificationUserAction({
  education,
  degrees,
  experiences,
}: IQualification) {
  return db.$transaction(
    async (tx) => {
      const session = await getServerAuthSession();
      if(!session){
        throw new Error("Unauthorised")
      }
      if(!session.user.email){
        throw new Error("Unauthorised")
      }
      const professionalUser = await db.professionalUser.findFirst({
        where: {
          email: session.user.email ,
        },
        select: {
          id: true,
        },
      });

      try {
        // Updating aboutEducation
        await tx.professionalUser.update({
          where: {
            id: professionalUser?.id,
          },
          data: {
            aboutEducation: education,
          },
        });

        // // delete degrees
        await tx.professionalDegree.deleteMany({
          where: {
            professionalUserId: professionalUser?.id,
          },
        });

        // // create new degrees
        await tx.professionalDegree.createMany({
          data: degrees.map((degree) => ({
            degree: degree.degree,
            professionalUserId: professionalUser?.id!,
          })),
        });

        // delete  experiences
        await tx.professionalExperience.deleteMany({
          where: {
            professionalUserId: professionalUser?.id,
          },
        });
        // create new experiences
        await tx.professionalExperience.createMany({
          data: experiences.map((experience) => ({
            // years: experience.years,
            startingYear : experience.startingYear!,
            endingYear : experience.endingYear!,
            department: experience.department!,
            location: experience.location!,
            position: experience.position!,
            professionalUserId: professionalUser?.id!,
          })),
        });

        revalidatePath("/edit-profile/qualification");
        revalidatePath("/doctor-profile");
        return {
          message: "Qualification has been updated",
        };
      } catch (error) {
        console.log("editqualf", error);
        throw new Error("Failed to Update Qualifications");
      }
    },
    {
      timeout: 10000, // default: 5000
    },
  );
}
export default EditQualificationUserAction;
