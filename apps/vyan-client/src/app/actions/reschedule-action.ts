"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateEvent } from "~/lib/create-event";

import { db } from "~/server/db";
interface IRescheduleDetails {
  startingTime: Date;
  endingTime: Date;
  appointmentId: string;
  professionalUserId?: string;
  eventId?: string;
}

const RescheduleAction = async ({
  startingTime,
  endingTime,
  appointmentId,
  eventId,
  professionalUserId,
}: IRescheduleDetails) => {
  const session = await getServerSession();
  if (!session) {
    return {
      error: "Unauthorised",
    };
  }

  const formSchema = z.object({
    startingTime: z.date(),
    endingTime: z.date(),
    appointmentId: z.string(),
  });

  const isValid = formSchema.safeParse({
    startingTime,
    endingTime,
    appointmentId,
  });

  if (!isValid) {
    return {
      error: "Invalid data",
    };
  }

  console.log("🔄 Reschedule Action: Starting reschedule", {
    appointmentId,
    eventId,
    professionalUserId,
    startingTime,
    endingTime,
  });

  try {
    // First get appointment details
    const appointment = await db.bookAppointment.findUnique({
      where: { id: appointmentId },
      select: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        planName: true,
        description: true,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Update the database
    await db.bookAppointment.update({
      data: {
        startingTime: startingTime,
        endingTime: endingTime,
      },
      where: {
        id: appointmentId,
      },
    });
    console.log("✅ Reschedule Action: Database updated");

    // Then try to update Google Calendar event
    if (eventId && professionalUserId) {
      try {
        console.log("🔄 Reschedule Action: Updating Google Calendar event");
        const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName || ""}`.trim();
        const response = await updateEvent({
          professionalUserId,
          eventId,
          newStartTime: startingTime,
          newEndTime: endingTime,
          patientName,
          patientEmail: appointment.patient.email,
          planName: appointment.planName,
          description: appointment.description || "",
        });

        // Update meeting details in database
        await db.bookAppointment.update({
          data: {
            meeting: response,
          },
          where: {
            id: appointmentId,
          },
        });
        console.log("✅ Reschedule Action: Google Calendar event updated");
      } catch (calendarError) {
        console.error("❌ Reschedule Action: Calendar update failed", calendarError);
        // Don't fail the reschedule if calendar update fails - database is already updated
        // But we should probably notify the user
      }
    } else {
      console.log("⚠️ Reschedule Action: No eventId or professionalUserId - skipping calendar update");
    }

    revalidatePath("/profile/appointments");
    return {
      message: "Appointment has been rescheduled",
    };
  } catch (error) {
    console.error("❌ Reschedule Action: Failed", error);
    throw new Error("Appointment cannot be rescheduled");
  }
};
export default RescheduleAction;
