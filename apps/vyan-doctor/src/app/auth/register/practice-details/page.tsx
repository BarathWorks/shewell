import { db } from "~/server/db";
import PracticeDetailsForm from "./practice-details-form";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

const PracticeDetailsPage = async () => {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const professionalUser = await db.professionalUser.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      sessionMode: true,
      listing: true,
    },
  });

  if (!professionalUser) {
    redirect("/auth/register/account-setup");
  }

  const experience = await db.professionalExperience.findFirst({
    select: {
      startingYear: true,
      endingYear: true,
      department: true,
      location: true,
      position: true,
    },
    where: {
      professionalUserId: professionalUser.id,
    },
  });

  // Calculate years of experience if both years exist
  const yearsOfExperience = 
    experience?.startingYear && experience?.endingYear
      ? (parseInt(experience.endingYear) - parseInt(experience.startingYear)).toString()
      : "";

  return (
    <>
      <PracticeDetailsForm
        department={experience?.department || ""}
        position={experience?.position || ""}
        location={experience?.location || ""}
        experience={yearsOfExperience}
        sessionMode={professionalUser.sessionMode || ""}
        listing={professionalUser.listing || ""}
      />
    </>
  );
};

export default PracticeDetailsPage;
