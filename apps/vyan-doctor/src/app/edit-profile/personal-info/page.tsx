import { db } from "~/server/db";
import PersonalInfoForm from "./personal-info-form";
import { getServerAuthSession } from "~/server/auth";

const PersonalInfo = async () => {
  const session = await getServerAuthSession();

  if(!session){
    return
  }

  const professionalUser = await db.professionalUser.findUnique({
    where: {
      email: session.user.email!,
    },
  });

  if (!professionalUser) {
    return;
  }
  const personalInfo = await db.professionalUser.findUnique({
    select: {
      firstName: true,
      email: true,
      phoneNumber: true,
      displayQualificationId: true,
      aboutYou: true,
    },
    where: {
      id: professionalUser.id,
    },
  });
  const specialisations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
    },
  });
  console.log(personalInfo);
  return (
    <>
      <PersonalInfoForm
        aboutYou={personalInfo?.aboutYou!}
        displayQualificationId={personalInfo?.displayQualificationId!}
        email={personalInfo?.email!}
        firstName={personalInfo?.firstName!}
        phoneNumber={personalInfo?.phoneNumber!}
        specialisations={specialisations.map((a) => ({
          value: a.id,
          label: a.specialization,
        }))}
      />
    </>
  );
};
export default PersonalInfo;
