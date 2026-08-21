"use server";

import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "~/server/auth";
import { logger } from "@repo/observability";

const CompleteAppointment = async ({
  appointmentId,
}: {
  appointmentId: string;
}) => {
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error("Unauthorised");
  }
  if (!session.user.email) {
    throw new Error("Unauthorised");
  }
  const professionalUser = await db.professionalUser.findFirst({
    where: {
      email: session.user.email,
      // A soft-deleted account must not be able to release earnings. Sign-in
      // already filters on this; the check has to hold here too.
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!professionalUser) {
    throw new Error("Professional User Not Found");
  }

  try {
    // Scoped to the caller, and only from the paid state.
    //
    // The ownership filter was commented out, so an appointment id alone let any
    // practitioner close out another's booking. That is not a display-only change:
    // completing an appointment releases its `AppointmentPayment`, which is exactly
    // what makes the money count toward a payable balance.
    //
    // `updateMany` rather than `update` because the filter is no longer a unique
    // key, and because a conditional update tells us whether it actually applied.
    const claimed = await db.bookAppointment.updateMany({
      data: {
        status: BookAppointmentStatus.COMPLETED,
      },
      where: {
        id: appointmentId,
        professionalUserId: professionalUser.id,
        status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
      },
    });

    if (claimed.count === 0) {
      // Not theirs, does not exist, or was never paid for. One message for all
      // three, so this cannot be used to probe for valid appointment ids.
      logger.warn("appointment.complete_rejected", {
        source: "doctor-action",
        route: "CompleteAppointment",
        userId: professionalUser.id,
      });
      throw new Error("Appointment cannot be marked as completed");
    }

    // Mark the AppointmentPayment as COMPLETED now that the consultation is done.
    // Scoped to this practitioner as well, so it can only ever release their own
    // earnings.
    await db.appointmentPayment.updateMany({
      data: {
        paymentStatus: "COMPLETED",
      },
      where: {
        appointmentId: appointmentId,
        doctorId: professionalUser.id,
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
    // Re-thrown as-is so the rejection message above reaches the practitioner
    // instead of being flattened into a generic failure.
    if (error instanceof Error) {
      throw error;
    }
    logger.error("appointment.complete_failed", {
      source: "doctor-action",
      route: "CompleteAppointment",
      userId: professionalUser.id,
      error,
    });
    throw new Error("Appointment can not marked with completed status");
  }
};
export default CompleteAppointment;
