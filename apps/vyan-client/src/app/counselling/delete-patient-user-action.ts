"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";

const DeletePatient = async ({ patientId }: { patientId: string }) => {
  const session = await getServerSession();
  const user = await db.user.findFirst({
    where: {
      email: session?.user.email!,
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
