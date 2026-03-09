import { db } from "~/server/db";
import PracticeDetailsForm from "./practice-details-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const PracticeDetailsPage = async () => {
  const session = await getServerSession();
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

  return (
    <>
      <PracticeDetailsForm
        department={experience?.department || ""}
        position={experience?.position || ""}
        location={experience?.location || ""}
        startingYear={experience?.startingYear || ""}
        endingYear={experience?.endingYear || ""}
        sessionMode={professionalUser.sessionMode || ""}
        listing={professionalUser.listing || ""}
      />
    </>
  );
};

export default PracticeDetailsPage;
