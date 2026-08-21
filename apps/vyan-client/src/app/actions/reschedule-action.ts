"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateEvent } from "~/lib/create-event";
import { BookAppointmentStatus } from "@repo/database";
import { format } from "date-fns";
import { sendEmail } from "@repo/mail";
import { getAppointmentRescheduleEmailTemplate } from "~/lib/email-templates";
import { logger } from "@repo/observability";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IRescheduleDetails {
  startingTime: Date;
  endingTime: Date;
  appointmentId: string;
  professionalUserId?: string;
  eventId?: string;
}

/**
 * Moves one of the caller's own appointments to a new time.
 *
 * This checked only that *a* session existed and then updated
 * `where: { id: appointmentId }`. With no `userId` in the filter, any signed-in
 * user could rewrite any other patient's appointment to any time they liked — and
 * the action then emailed that patient to confirm the change they had not made.
 *
 * Three things are now enforced:
 *
 *   - **Ownership**, in the `where` rather than checked afterwards.
 *   - **A slot-conflict check**, inside the same transaction as the write. There
 *     was none at all, so a reschedule could land on a time the practitioner had
 *     already sold to somebody else — the one invariant the booking path is careful
 *     about.
 *   - **The practitioner id comes from the row**, not from the request. It was
 *     previously taken from the caller and passed to the calendar update.
 */
const RescheduleAction = async ({
  startingTime,
  endingTime,
  appointmentId,
  eventId,
}: IRescheduleDetails) => {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return { error: "Unauthorised" };
  }

  const userId = session.user.id;

  const parsed = z
    .object({
      startingTime: z.coerce.date(),
      endingTime: z.coerce.date(),
      appointmentId: z.string().min(1),
    })
    .safeParse({ startingTime, endingTime, appointmentId });

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  const newStart = parsed.data.startingTime;
  const newEnd = parsed.data.endingTime;

  // Ordering and forward-dating were never checked, so an appointment could be
  // moved to end before it starts, or into the past.
  if (newEnd.getTime() <= newStart.getTime()) {
    return { error: "The end time must be after the start time" };
  }

  if (newStart.getTime() <= Date.now()) {
    return { error: "Please choose a time in the future" };
  }

  let appointment;

  try {
    appointment = await db.$transaction(
      async (tx) => {
        // Scoped to the caller. An appointment id alone must not be enough.
        const existing = await tx.bookAppointment.findFirst({
          where: { id: appointmentId, userId },
          select: {
            id: true,
            startingTime: true,
            endingTime: true,
            status: true,
            planName: true,
            description: true,
            professionalUserId: true,
            patient: {
              select: { firstName: true, lastName: true, email: true },
            },
            professionalUser: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        });

        if (!existing) {
          throw new RescheduleError("Appointment not found");
        }

        if (existing.status !== BookAppointmentStatus.PAYMENT_SUCCESSFUL) {
          throw new RescheduleError("This appointment cannot be rescheduled");
        }

        // The practitioner must actually be free then. Excludes this appointment,
        // and ignores cancelled rows the way the booking path does.
        const clash = await tx.bookAppointment.findFirst({
          where: {
            professionalUserId: existing.professionalUserId,
            startingTime: newStart,
            id: { not: existing.id },
            status: {
              notIn: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
          select: { id: true },
        });

        if (clash) {
          throw new RescheduleError(
            "That time is no longer available. Please choose another.",
          );
        }

        const moved = await tx.bookAppointment.updateMany({
          where: {
            id: existing.id,
            userId,
            status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
          },
          data: { startingTime: newStart, endingTime: newEnd },
        });

        if (moved.count === 0) {
          throw new RescheduleError("This appointment cannot be rescheduled");
        }

        return existing;
      },
      // Serializable, matching the booking path: the conflict check and the write
      // have to see the same world.
      { timeout: 10000, isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (error instanceof RescheduleError) {
      return { error: error.message };
    }
    logger.error("appointment.reschedule_failed", {
      source: "client-action",
      route: "RescheduleAction",
      userId,
      error,
    });
    return { error: "Appointment cannot be rescheduled" };
  }

  // ── Side effects. None of these may undo the reschedule, which has committed.

  const professionalUserId = appointment.professionalUserId;

  if (eventId && professionalUserId) {
    try {
      const patientName =
        `${appointment.patient.firstName} ${appointment.patient.lastName ?? ""}`.trim();

      const response = await updateEvent({
        professionalUserId,
        eventId,
        newStartTime: newStart,
        newEndTime: newEnd,
        patientName,
        patientEmail: appointment.patient.email,
        planName: appointment.planName,
        description: appointment.description ?? "",
      });

      await db.bookAppointment.updateMany({
        where: { id: appointment.id, userId },
        data: { meeting: response },
      });
    } catch (calendarError) {
      logger.warn("appointment.reschedule_calendar_failed", {
        source: "client-action",
        appointmentId: appointment.id,
        error: calendarError,
      });
    }
  }

  try {
    const doctorName =
      `${appointment.professionalUser.firstName ?? ""} ${appointment.professionalUser.lastName ?? ""}`.trim() ||
      "your practitioner";

    const oldTime = `${format(appointment.startingTime, "hh:mm a")} - ${format(appointment.endingTime, "hh:mm a")}`;
    const newTime = `${format(newStart, "hh:mm a")} - ${format(newEnd, "hh:mm a")}`;

    const emailTemplate = getAppointmentRescheduleEmailTemplate({
      userName: appointment.patient.firstName,
      userEmail: appointment.patient.email,
      doctorName,
      oldDate: appointment.startingTime,
      newDate: newStart,
      oldTime,
      newTime,
      planName: appointment.planName || "Appointment",
    });

    await sendEmail({
      from: process.env.FROM_EMAIL!,
      to: [appointment.patient.email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (appointment.professionalUser.email) {
      await sendEmail({
        from: process.env.FROM_EMAIL!,
        to: [appointment.professionalUser.email],
        subject: `Appointment rescheduled - ${appointment.patient.firstName}`,
        html: emailTemplate.html.replace(
          appointment.patient.firstName,
          doctorName,
        ),
      });
    }
  } catch (emailError) {
    logger.error("appointment.reschedule_email_failed", {
      source: "client-action",
      appointmentId: appointment.id,
      error: emailError,
    });
  }

  revalidatePath("/profile/appointments");

  logger.info("appointment.rescheduled", {
    source: "client-action",
    userId,
    appointmentId: appointment.id,
  });

  return { message: "Appointment has been rescheduled" };
};

/** Carries a message meant for the customer, distinct from an unexpected failure. */
class RescheduleError extends Error {}

export default RescheduleAction;
