"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";

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
  const session = await getServerSession();
  // console.log("bhu", session?.user.id);

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

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || null;

    await db.professionalUser.update({
      where: {
        email: session?.user.email!,
      },
      data: {
        firstName,
        lastName,
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
