import { db } from "~/server/db";
import QualificationForm from "./qualification-form";
import { getServerAuthSession } from "~/server/auth";

const Qualificaiton = async () => {
  const session = await getServerAuthSession();
  if(!session){
    throw new Error("Unauthorised")
  }
  if(!session.user.email){
    throw new Error("Unauthorised")
  }
  const professionalUser = await db.professionalUser.findUnique({
    where: {
      email: session.user.email,
    },
  });
  if (!professionalUser) {
    return;
  }
  const aboutEducation = await db.professionalUser.findUnique({
    select: {
      aboutEducation: true,
    },
    where: { id: professionalUser.id },
  });
  const degrees = await db.professionalDegree.findMany({
    select: {
      id: true,
      degree: true,
    },
    where: {
      professionalUserId: professionalUser.id,
    },
  });
  const experiences = await db.professionalExperience.findMany({
    select: {
      id: true,
      // years: true,
      startingYear : true,
      endingYear : true,
      department: true,
      position: true,
      location: true,
    },
    where: {
      professionalUserId: professionalUser.id,
    },
  });

  console.log(aboutEducation, degrees, experiences);
  return (
    <>
      <QualificationForm
        aboutEducation={aboutEducation?.aboutEducation!}
        degrees={degrees}
        experiences={experiences}
      />
    </>
  );
};
export default Qualificaiton;
