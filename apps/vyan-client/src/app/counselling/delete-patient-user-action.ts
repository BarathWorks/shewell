"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

const DeletePatient = async ({ patientId }: { patientId: string }) => {
  const session = await getServerAuthSession();

  // Server actions are POST endpoints reachable without a session. Without this
  // guard `session?.user.email` is undefined, Prisma drops the filter, and
  // `findFirst` returns the first user in the table — so an unauthenticated caller
  // acts as whoever that happens to be.
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    };
  }

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null,
    },
  });
  if (!user) {
    return;
  }
  try {

   
    await db.patient.update({
      data:{
        deletedAt : new Date()
      },
      where: {
        id: patientId,
        userId: user.id!,
      },
    });
    
    revalidatePath("/counselling");
    
    return {
      message: "Patient Info has been deleted",
    };
  } catch (error) {
    console.log("deletePatient", error);
    throw new Error("Patient Info cannot be  deleted ");
  }
};
export default DeletePatient;
