import { db } from "~/server/db";
import PersonalInfoForm from "./personal-info-form";
import { redirect } from "next/navigation";
import React from "react";
import { getServerAuthSession } from "~/server/auth";

const PersonalInfoPage = async () => {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const professionalUser = await db.professionalUser.findFirst({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dob: true,
      phoneNumber: true,
      gender: true,
      aboutYou: true,
      mediaId: true,
      media: {
        select: {
          fileUrl: true,
        },
      },
    },
    where: {
      email: session.user.email,
    },
  });

  if (!professionalUser) {
    redirect("/auth/register/account-setup");
  }

  // Fetch languages options
  const languagesOptions = await db.professionalLanguages.findMany({
    select: {
      id: true,
      language: true,
    },
  });

  // Fetch already selected languages for this user
  const selectedLanguages = await db.professionalLanguages.findMany({
    select: {
      id: true,
      language: true,
    },
    where: {
      professionalUsers: {
        some: {
          id: professionalUser.id,
        },
      },
      active: true,
    },
  });

  const formattedLanguagesOptions = languagesOptions.map((item) => ({
    id: item.id,
    name: item.language,
  }));

  const formattedDefaultLanguages = selectedLanguages.map((item) => ({
    id: item.id,
    name: item.language,
  }));

  return (
    <>
      <PersonalInfoForm
        languagesOptions={formattedLanguagesOptions}
        existingData={{
          firstName: professionalUser.firstName || "",
          lastName: professionalUser.lastName,
          dob: professionalUser.dob,
          phoneNumber: professionalUser.phoneNumber,
          gender: professionalUser.gender,
          aboutYou: professionalUser.aboutYou,
          mediaId: professionalUser.mediaId,
        }}
        professionalUserId={professionalUser.id}
        fileUrl={professionalUser.media?.fileUrl || null}
        defaultLanguages={formattedDefaultLanguages}
      />
    </>
  );
};

export default PersonalInfoPage;
