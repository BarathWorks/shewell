import { db } from "~/server/db";
import EducationForm from "./education-form";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

const EducationPage = async () => {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const specialisations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
    },
    where: {
      active: true,
    },
  });

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      displayQualificationId: true,
    },
  });

  if (!professionalUser) {
    redirect("/auth/register/account-setup");
  }

  const degree = await db.professionalDegree.findFirst({
    select: {
      degree: true,
      collegeName: true,
      completionDate: true,
    },
    where: {
      professionalUserId: professionalUser.id,
    },
  });

  return (
    <>
      <EducationForm
        specialisations={specialisations.map((a) => ({
          value: a.id,
          label: a.specialization,
        }))}
        degree={degree?.degree || ""}
        collegeName={degree?.collegeName || ""}
        completionDate={
          degree?.completionDate
            ? degree.completionDate.toISOString().split("T")[0]
            : ""
        }
        displayQualificationId={
          professionalUser.displayQualificationId || ""
        }
      />
    </>
  );
};

export default EducationPage;
