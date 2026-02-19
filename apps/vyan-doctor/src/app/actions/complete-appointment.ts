"use server";

import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { revalidatePath } from "next/cache";

const CompleteAppointment = async ({
  appointmentId,
}: {
  appointmentId: string;
}) => {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorised");
  }
  if (!session.user.email) {
    throw new Error("Unauthorised");
  }
  const professionalUser = await db.professionalUser.findFirst({
    where: {
      email: session.user.email,
    },
  });

  if (!professionalUser) {
    throw new Error("Professional User Not Found");
  }

  try {
    await db.bookAppointment.update({
      data: {
        status: BookAppointmentStatus.COMPLETED,
      },
      where: {
        id: appointmentId,
        // professionalUserId: professionalUser?.id,
      },
    });

    // Mark the AppointmentPayment as COMPLETED now that the consultation is done
    await db.appointmentPayment.updateMany({
      data: {
        paymentStatus: "COMPLETED",
      },
      where: {
        appointmentId: appointmentId,
        paymentStatus: "PENDING",
      },
    });

    const consultations = await db.bookAppointment.aggregate({
      _count: {
        status: true,
      },
      where: {
        status: BookAppointmentStatus.COMPLETED,
        professionalUserId: professionalUser.id,
      },
    });

    console.log("noOfConsultations", consultations);

    await db.professionalUser.update({
      data: {
        totalConsultations: consultations._count.status,
      },
      where: {
        id: professionalUser.id,
      },
    });
    revalidatePath("/appointment");
    return {
      message: "Appointment is completed",
    };
  } catch (error) {
    console.log("complete-appointment-error", error);
    throw new Error("Appointment can not marked with completed status");
  }
};
export default CompleteAppointment;
