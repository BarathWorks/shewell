"use server";

import { getServerSession } from "next-auth";
import { useRouter } from "next/navigation";
import { db } from "~/server/db";

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
  const session = await getServerSession();
  console.log("findsession", session);
  // if (!session) {
  //   router.push("/login");
  // }
  try {
    const user = await db.user.findFirst({
      select: {
        id: true,
      },
      where: {
        email: session?.user.email!,
      },
    });

   
    await db.patient.update({
      data : {
        firstName : firstName,
        lastName :lastName,
        phoneNumber : phoneNumber,
        email :email,
        message : message,
     
      },
      where:{
        id: patientsId,
        userId : user?.id
      }
    })
    await db.additionalPatient.deleteMany({
      where : {
        patientId : patientsId
      }
    })
    await db.additionalPatient.createMany({
      data : additionalPatients.map((item) => ({
        firstName : item.firstName,
        lastName : item.lastName,
        phoneNumber : item.phoneNumber,
        email : item.email,
        message : item.message,
        patientId :patientsId
      }))
    })
    return {
      message: "Patient has been added",
    };
  } catch (error) {
    console.log("findError", error);
    throw new Error("Patient has not been added");
  }
};

export default EditPatientUserAction;
