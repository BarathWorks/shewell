"use server";

import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

export interface IPatientProps {
  firstName: string;
  lastName?: string | null;
  email: string;
  phoneNumber: string;
  message?: string | null;
}

const EditPatientUserAction = async (
  {
    additionalPatients,
    firstName,
    lastName,
    phoneNumber,
    email,
    message,
  }: {
    additionalPatients: IPatientProps[];
    firstName: string;
    lastName?: string | null;
    phoneNumber: string;
    email: string;
    message?: string | null;
  },
  { patientsId }: { patientsId: string }
) => {
  // const router = useRouter();
  const session = await getServerAuthSession();

  // This guard was commented out. Server actions are POST endpoints reachable
  // without a session, and an undefined email drops the Prisma filter — so an
  // unauthenticated caller was editing the first user's patient records.
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    // Ownership is established once, up front, and every write below keys off the
    // row it returns.
    //
    // The parent `patient.update` was scoped by `userId`, but the two
    // `additionalPatient` writes that follow were keyed on `patientsId` alone — so
    // any signed-in user could wipe and rewrite the co-patients attached to
    // somebody else's patient record. Scoping one write and not the next two is the
    // same hole as scoping none of them.
    const patient = await db.patient.findFirst({
      where: {
        id: patientsId,
        userId: session.user.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!patient) {
      return { error: "Patient not found" };
    }

    // One transaction: a half-applied edit would leave the record with the new
    // co-patients deleted and none created.
    await db.$transaction(async (tx) => {
      await tx.patient.update({
        data: {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          email: email,
          message: message,
        },
        where: { id: patient.id },
      });

      await tx.additionalPatient.deleteMany({
        where: { patientId: patient.id },
      });

      if (additionalPatients.length > 0) {
        await tx.additionalPatient.createMany({
          data: additionalPatients.map((item) => ({
            firstName: item.firstName,
            lastName: item.lastName,
            phoneNumber: item.phoneNumber,
            email: item.email,
            message: item.message,
            patientId: patient.id,
          })),
        });
      }
    });

    revalidatePath("/counselling");

    return {
      message: "Patient has been updated",
    };
  } catch (error) {
    console.log("findError", error);
    throw new Error("Patient has not been added");
  }
};

export default EditPatientUserAction;
