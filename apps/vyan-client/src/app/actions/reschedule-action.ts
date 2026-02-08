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
        startingTime: true, // Fetch original starting time
        endingTime: true,   // Fetch original ending time
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

    // Send reschedule notification emails
    try {
      const { sendEmail } = await import("@repo/mail");
      const { getAppointmentRescheduleEmailTemplate } = await import("~/lib/email-templates");
      const { format } = await import("date-fns");

      // Get the updated appointment with full details
      const updatedAppointment = await db.bookAppointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            select: {
              firstName: true,
              email: true,
            },
          },
          professionalUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (updatedAppointment) {
        const oldTime = `${format(appointment.startingTime!, "hh:mm a")} - ${format(appointment.endingTime!, "hh:mm a")}`;
        const newTime = `${format(startingTime, "hh:mm a")} - ${format(endingTime, "hh:mm a")}`;
        const doctorName = `${updatedAppointment.professionalUser.firstName} ${updatedAppointment.professionalUser.lastName || ""}`.trim();

        // Email to patient
        const patientEmailTemplate = getAppointmentRescheduleEmailTemplate({
          userName: updatedAppointment.patient.firstName,
          userEmail: updatedAppointment.patient.email!,
          doctorName: doctorName,
          oldDate: appointment.startingTime!,
          newDate: startingTime,
          oldTime: oldTime,
          newTime: newTime,
          planName: updatedAppointment.planName || "Appointment",
        });

        await sendEmail({
          from: process.env.FROM_EMAIL!,
          to: [updatedAppointment.patient.email!],
          subject: patientEmailTemplate.subject,
          html: patientEmailTemplate.html,
        });

        // Email to doctor
        if (updatedAppointment.professionalUser.email) {
          await sendEmail({
            from: process.env.FROM_EMAIL!,
            to: [updatedAppointment.professionalUser.email],
            subject: `📅 Appointment Rescheduled - ${updatedAppointment.patient.firstName}`,
            html: patientEmailTemplate.html.replace(updatedAppointment.patient.firstName, doctorName),
          });
        }
      }
    } catch (emailError) {
      console.error("Failed to send reschedule emails:", emailError);
      // Don't fail the reschedule if email fails
    }

    return {
      message: "Appointment has been rescheduled",
    };
  } catch (error) {
    console.error("❌ Reschedule Action: Failed", error);
    throw new Error("Appointment cannot be rescheduled");
  }
};
export default RescheduleAction;
