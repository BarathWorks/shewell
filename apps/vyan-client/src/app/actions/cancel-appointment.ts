"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { differenceInMinutes, format } from "date-fns";
import { processRefund } from "./refund-payment";
import { deleteEvent } from "~/lib/create-event";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@repo/mail";
import { getAppointmentCancelEmailTemplate } from "~/lib/email-templates";
import { logger } from "@repo/observability";

/**
 * Cancels one of the caller's own appointments.
 *
 * The previous version cancelled nothing. It deleted the Google Calendar event
 * inside a `try` block that ended with `return { message: "Meeting response has
 * been updated" }` — so on the ordinary path, where calendar deletion succeeds, the
 * function returned there and every line below it was unreachable: the status
 * change, the refund, and both emails. The customer saw a success toast, the
 * booking stayed PAYMENT_SUCCESSFUL, and the money stayed taken.
 *
 * The rewrite keeps the same inputs and the same `{ message }` return shape the two
 * callers read, and changes four things:
 *
 *   - **Calendar deletion is best-effort and never terminal.** It is a side effect
 *     of cancelling, not a precondition for it, so its failure — or its success —
 *     cannot decide whether the booking gets cancelled.
 *
 *   - **The refund window is computed from a signed difference.** The old check was
 *     `Math.abs(diff) < 120`, so an appointment that had already finished ten hours
 *     ago produced `abs(-600) = 600`, fell into the `else`, and was refunded in
 *     full. Cancelling something already past is now refused outright.
 *
 *   - **The transition is claimed before the gateway is called.** A conditional
 *     `updateMany` off PAYMENT_SUCCESSFUL means two concurrent cancellations cannot
 *     both reach `processRefund`. If the refund then fails, the status is put back
 *     rather than left cancelled with the money still taken.
 *
 *   - **No surrounding transaction.** The old body opened `db.$transaction` and
 *     then made Google Calendar, Razorpay and email-provider calls inside it while
 *     writing through `db` rather than `tx` — so it held a transaction open across
 *     three third-party round trips and got no atomicity in exchange. The
 *     conditional update above provides what the transaction was supposed to.
 */
async function CancelAppointment({
  eventId,
  appointmentId,
  professionalUserId,
}: {
  appointmentId: string;
  eventId: string;
  professionalUserId: string;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new Error("Please sign in to continue");
  }

  const userId = session.user.id;

  // Scoped to the caller: an appointment id alone must not be enough to cancel a
  // booking or move money.
  const appointment = await db.bookAppointment.findFirst({
    where: { id: appointmentId, userId },
    select: {
      id: true,
      startingTime: true,
      endingTime: true,
      planName: true,
      status: true,
      priceInCents: true,
      totalPriceInCents: true,
      razorpayPaymentId: true,
      razorpayRefundId: true,
      professionalUserId: true,
      patient: { select: { firstName: true, email: true } },
      professionalUser: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (
    appointment.status === BookAppointmentStatus.CANCELLED ||
    appointment.status === BookAppointmentStatus.CANCELLED_WITH_REFUND
  ) {
    return { message: "This appointment has already been cancelled" };
  }

  if (appointment.status !== BookAppointmentStatus.PAYMENT_SUCCESSFUL) {
    throw new Error("This appointment cannot be cancelled");
  }

  // Signed, not absolute. Positive means the appointment is still ahead of us.
  const minutesUntilStart = differenceInMinutes(
    appointment.startingTime,
    new Date(),
  );

  if (minutesUntilStart <= 0) {
    throw new Error("This appointment has already started and cannot be cancelled");
  }

  const withinRefundWindow = minutesUntilStart >= 120;

  // What the customer actually paid, tax included. `priceInCents` is the pre-GST
  // base, so refunding it silently kept the tax.
  const refundAmount =
    appointment.totalPriceInCents ?? appointment.priceInCents;

  const nextStatus = withinRefundWindow
    ? BookAppointmentStatus.CANCELLED_WITH_REFUND
    : BookAppointmentStatus.CANCELLED;

  // Claim the cancellation first, and only from the paid state. Whoever wins this
  // is the only caller that goes on to issue a refund.
  const claimed = await db.bookAppointment.updateMany({
    where: {
      id: appointment.id,
      userId,
      status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
    },
    data: { status: nextStatus },
  });

  if (claimed.count === 0) {
    return { message: "This appointment has already been cancelled" };
  }

  if (withinRefundWindow) {
    if (!appointment.razorpayPaymentId) {
      // Nothing to refund against. Roll the claim back so the booking is not left
      // marked as refunded when no refund exists.
      await db.bookAppointment.updateMany({
        where: { id: appointment.id, userId },
        data: { status: BookAppointmentStatus.PAYMENT_SUCCESSFUL },
      });
      throw new Error("This appointment has no payment to refund");
    }

    if (!appointment.razorpayRefundId) {
      try {
        await processRefund(
          appointment.razorpayPaymentId,
          refundAmount,
          appointment.id,
        );
      } catch (refundError) {
        await db.bookAppointment.updateMany({
          where: { id: appointment.id, userId },
          data: { status: BookAppointmentStatus.PAYMENT_SUCCESSFUL },
        });
        logger.error("appointment.refund_failed", {
          source: "client-action",
          route: "CancelAppointment",
          userId,
          appointmentId: appointment.id,
          error: refundError,
        });
        throw new Error(
          "Refund could not be processed. Your appointment is unchanged.",
        );
      }
    }
  }

  // ── Everything past this point is a side effect of a cancellation that has
  // ── already happened. None of it may change the outcome.

  // Best-effort calendar cleanup. Previously this ran first and its success
  // short-circuited the whole function.
  if (eventId && professionalUserId) {
    try {
      const response = await deleteEvent({ eventId, professionalUserId });
      await db.bookAppointment.updateMany({
        where: { id: appointment.id, userId },
        data: { meeting: response },
      });
    } catch (calendarError) {
      logger.warn("appointment.calendar_delete_failed", {
        source: "client-action",
        route: "CancelAppointment",
        appointmentId: appointment.id,
        error: calendarError,
      });
    }
  }

  try {
    const appointmentTime = `${format(appointment.startingTime, "hh:mm a")} - ${format(appointment.endingTime, "hh:mm a")}`;
    const doctorName =
      `${appointment.professionalUser.firstName ?? ""} ${appointment.professionalUser.lastName ?? ""}`.trim() ||
      "your practitioner";

    const emailTemplate = getAppointmentCancelEmailTemplate({
      userName: appointment.patient.firstName,
      userEmail: appointment.patient.email,
      doctorName,
      appointmentDate: appointment.startingTime,
      appointmentTime,
      planName: appointment.planName || "Appointment",
      ...(withinRefundWindow ? { refundAmount } : {}),
      hasRefund: withinRefundWindow,
    });

    if (appointment.patient.email) {
      await sendEmail({
        from: process.env.FROM_EMAIL!,
        to: [appointment.patient.email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    if (appointment.professionalUser.email) {
      await sendEmail({
        from: process.env.FROM_EMAIL!,
        to: [appointment.professionalUser.email],
        subject: `Appointment cancelled - ${appointment.patient.firstName}`,
        html: emailTemplate.html.replace(
          appointment.patient.firstName,
          doctorName,
        ),
      });
    }
  } catch (emailError) {
    logger.error("appointment.cancel_email_failed", {
      source: "client-action",
      route: "CancelAppointment",
      appointmentId: appointment.id,
      error: emailError,
    });
  }

  revalidatePath("/profile/appointments");

  logger.info("appointment.cancelled", {
    source: "client-action",
    userId,
    appointmentId: appointment.id,
    refunded: withinRefundWindow,
  });

  return {
    message: withinRefundWindow
      ? "Appointment has been cancelled with refund"
      : "Appointment has been cancelled without refund",
  };
}

export default CancelAppointment;
