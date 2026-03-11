"use server";

import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

interface IPatientProps {
  firstName: string;
  lastName?: string | undefined;
  email: string;
  phoneNumber: string;
  message?: string | undefined;
}

const AddNewPatientUserAction = async ({
  firstName,
  lastName,
  email,
  phoneNumber,
  message,
  additionalPatients
}: {additionalPatients : IPatientProps[],
  firstName : string,
  lastName? : string | undefined,
  email : string,
  phoneNumber : string,
  message? : string | undefined
}) => {
  
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  try {
    await db.patient.create({
      data:{
        firstName : firstName,
        lastName : lastName,
        email  : email ,
        phoneNumber : phoneNumber,
        message : message,
        additionalPatients: { createMany: { data: additionalPatients.map((patient) => ({
          firstName : patient.firstName,
          lastName : patient.lastName,
          phoneNumber : patient.phoneNumber,
          email : patient.email,
          message : patient.message
          
        })) } },
        userId : session.user.id
      }
    })
    
    revalidatePath("/counselling");
    
    return {
      message: "Patient has been added",
    };
  } catch (error) {
    throw new Error("Patient has not been added");
  }
};

export default AddNewPatientUserAction;
