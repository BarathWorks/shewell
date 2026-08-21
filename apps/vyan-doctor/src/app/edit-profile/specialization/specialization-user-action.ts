"use server";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface ISpecialization {
  value: string;
  label: string;
}
interface ISpecializationProps {
  specializations: ISpecialization[];
}
const SpecializationUserAction = async ({
  specializations,
}: ISpecializationProps) => {
  const session = await getServerAuthSession();

  // The session was fetched and only logged, never checked — and the log printed
  // the whole session object on every call. This app does not strip console
  // statements in production.
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  try {
    // Resolved by id from the session rather than by an unchecked email.
    const professionalUser = await db.professionalUser.findFirst({
      where: {
        id: session.user.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    // check if professional user exists
    if (!professionalUser) {
      return {
        message: "Professional User do not exist",
      };
    }

    const specializationConnect = specializations.map((s) => ({
      id: s.value,
      specialization: s.label,
    }));

    await db.professionalUser.update({
      where: {
        id: professionalUser.id,
      },
      data: {
        ProfessionalSpecializations: {
          set: [],
        },
      },
    });

    // update the professional specializations corresponding to professionalUserId
    await db.professionalUser.update({
      where: {
        id: professionalUser.id,
      },
      data: {
        ProfessionalSpecializations: {
          connect: specializationConnect,
        },
      },
    });

    revalidatePath("/doctor-profile");
    return {
      message: "Successfully added the specialisations",
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to add specialization");
  }
};
export default SpecializationUserAction;
