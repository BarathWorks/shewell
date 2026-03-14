"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";

interface ILanguageProps {
  id: string;
  name: string;
}

interface IPersonalInfoProps {
  firstName: string;
  lastName?: string;
  dob: Date;
  phoneNumber: string;
  gender: string;
  languages: ILanguageProps[];
  aboutYou: string;
  mediaId?: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const PersonalInfoUserAction = async ({
  firstName,
  lastName,
  dob,
  phoneNumber,
  gender,
  languages,
  aboutYou,
  mediaId,
}: IPersonalInfoProps): Promise<ActionResult> => {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorised user" };
  }

  const professionalUser = await db.professionalUser.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!professionalUser) {
    return { success: false, error: "Professional User does not exist" };
  }

  try {
    // Update personal info fields
    await db.professionalUser.update({
      data: {
        firstName,
        lastName: lastName || null,
        dob,
        phoneNumber,
        gender,
        aboutYou,
        ...(mediaId ? { mediaId } : {}),
      },
      where: {
        email: session.user.email,
      },
    });

    // Update languages: disconnect all first, then connect new ones
    const languageConnect = languages.map((item) => ({
      id: item.id,
      language: item.name,
    }));

    await db.professionalUser.update({
      where: {
        id: professionalUser.id,
      },
      data: {
        languages: {
          set: [],
        },
      },
    });
    await db.professionalUser.update({
      where: {
        id: professionalUser.id,
      },
      data: {
        languages: {
          connect: languageConnect,
        },
      },
    });

    revalidatePath("/auth/register/personal-info");
    return {
      success: true,
      message: "Successfully saved personal information",
    };
  } catch (error) {
    console.error("Failed to save personal info", error);
    return { success: false, error: "Failed to save personal information" };
  }
};

export default PersonalInfoUserAction;
