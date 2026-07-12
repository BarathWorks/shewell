import { db } from "~/server/db";
import PersonalInfoForm from "./personal-info-form";
import { getServerSession } from "next-auth";

const PersonalInfo = async () => {
  const session = await getServerSession();

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
      lastName: true,
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
  const fullName = `${personalInfo?.firstName || ""} ${personalInfo?.lastName || ""}`.trim();
  return (
    <>
      <PersonalInfoForm
        aboutYou={personalInfo?.aboutYou!}
        displayQualificationId={personalInfo?.displayQualificationId!}
        email={personalInfo?.email!}
        firstName={fullName}
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
