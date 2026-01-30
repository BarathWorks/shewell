"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { useRouter } from "next/navigation";
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
  
  const session = await getServerSession();
 
  
  try {
    const user = await db.user.findFirst({
      select: {
        id: true,
      },
      where: {
        email: session?.user.email!,
      },
    });

    
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
        userId : user?.id
      }
    })
    
    revalidatePath("/counselling");
    
    return {
      message: "Patient has been added",
    };
  } catch (error) {
    console.log("findError", error);
    throw new Error("Patient has not been added");
  }
};

export default AddNewPatientUserAction;
