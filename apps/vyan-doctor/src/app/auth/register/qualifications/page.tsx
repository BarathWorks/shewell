
import { db } from "~/server/db";
import QualificationForm from "./qualification-form";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

const Qualification = async () => {
  const specialisations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
    },
    where: {
      active: true
    }
  });
  const session = await getServerAuthSession();
  console.log("session", session);

  const professionalUser = await db.professionalUser.findFirst({
    where: {
      email: session?.user.email!,
    },
  });

  const experience = await db.professionalExperience.findFirst({
    select: {
      startingYear: true,
      endingYear: true,
      department: true,
      location: true,
      position: true,
    },
    where: {
      professionalUserId: professionalUser?.id,
    },
  });

  const degree = await db.professionalDegree.findFirst({
    select: {
      degree: true,
    },
    where: {
      professionalUserId: professionalUser?.id,
    },
  });

  const languages = await db.professionalLanguages?.findMany({
    select: {
      id: true,
      language: true,
    },
    where: {
      professionalUsers: {
        some: {
          id: professionalUser?.id,
        },
      },
      active: true
    },
  });

  const languagesOptions = await db.professionalLanguages.findMany({
    select: {
      id: true,
      language: true,
    }
  })
  
  console.log("languages", languages)
  const formattedDefaultLanguages = languages.map((item) => ({
    id: item.id,
    name: item.language,
  }));

  const formattedLanguagesOptions = languagesOptions.map((item) => ({
    id: item.id,
    name: item.language
  }))

  return (
    <>
      <QualificationForm
        specialisations={specialisations.map((a) => ({
          value: a.id,
          label: a.specialization,
        }))}
        defaultLanguages={formattedDefaultLanguages}
        degree={degree?.degree!}
        gender={professionalUser?.gender!}
        startingYear={experience?.startingYear!}
        endingYear={experience?.endingYear!}
        department={experience?.department!}
        position={experience?.position!}
        location={experience?.location!}
        languagesOptions={formattedLanguagesOptions}
        displayQualificationId={professionalUser?.displayQualificationId!}
      />
    </>
  );
};

export default Qualification;
