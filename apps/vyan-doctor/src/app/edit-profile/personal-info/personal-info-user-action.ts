"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

export interface IPersonalInfo {
  fullName: string;
  phoneNumber: string;
  // alternativeNumber: string;
  displayQualificationId?: string;
  bio?: string;
  // id: string
}
const PersonalInfoUserAction = async ({
  fullName,
  phoneNumber,
  // alternativeNumber,
  displayQualificationId,
  bio,
    // id
}: IPersonalInfo) => {
  const session = await getServerAuthSession();

  // The session was fetched and never checked. This only failed closed by accident:
  // `email: undefined` in a `update`'s unique `where` makes Prisma throw rather
  // than match everything, so an unauthenticated call errored instead of editing
  // someone's profile. That is luck, not a guard — an `updateMany` here would have
  // dropped the filter and rewritten every practitioner.
  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  // ProfessionalUserId during the session
  // const professionalUserId = await db.professionalUser.findFirst({
  //   select: {
  //     id: true,
  //   },
  //   where: {
  //     email: session?.user.email,
  //   },
  // });

  // console.log("professionalUserIdd", professionalUserId?.id);

  try {
    // await db.professionalUser.update({
    //   where: {
    //     email: session?.user.email!,
    //   },
    //   data: {
    //     firstName: fullName,
    //     phoneNumber: phoneNumber,
    //     aboutYou: bio,
    //     displayQualificationId: displayQualificationId,
    //   },
    // });
    // await db.professionalUser.deleteMany({
      
    //   where: {
    //     id: professionalUserId?.id,
    //   },
    // });
    // await db.professionalUser.create({
    //   data: {
    //     firstName: fullName,
    //     phoneNumber: phoneNumber,
    //     aboutYou: bio,
    //     displayQualificationId: displayQualificationId,
    //     email: session?.user.email,
    //   },
    // });

    await db.professionalUser.update({
        where: {
          // Resolved from the session, and now guaranteed present by the check above.
          email: session.user.email,
        },
        data: {
          firstName: fullName,
          phoneNumber: phoneNumber,
          aboutYou: bio,
          displayQualificationId: displayQualificationId,
        },
      });
    
    //All Professional Qualifications where professional user id is "ProfessionalUserId during the session"
    // const qualification = await db.professionalQualifications.findFirst({
    //   where: {
    //     professionalUserId: professionalUserId?.id,
    //   },
    // });
    // await db.professionalQualifications.update({
    //   where: {
    //     //   id:
    //     //  professionalUserId : session?.user.id!
    //     // professionalUserId: professionalUserId?.id,
    //     id: qualification?.id,
    //   },
    //   data: {
    //     : displayedQualification,
    //   },
    // });
    revalidatePath("/edit-profile/personal-info");
    revalidatePath("/doctor-profile");
    return {
      message: "Personal Information has been updated",
    };
  } catch (error) {
    console.log("personal-info-update", error);
    throw new Error("Personal info has not been updated");
  }
};

export default PersonalInfoUserAction;
