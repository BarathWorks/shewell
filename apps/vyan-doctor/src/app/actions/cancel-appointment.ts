"use server";

import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { differenceInMinutes } from "date-fns";
import { processRefund } from "./refund-action";
import { getServerAuthSession } from "~/server/auth";
import { logger } from "@repo/observability";

/**
 * Cancels one of the signed-in practitioner's own appointments, refunding the
 * patient.
 *
 * Every export of a `"use server"` module is a public POST endpoint, and this one
 * is imported by a client component, so its action id ships to every browser that
 * loads the appointment screen. It previously fetched the session into a variable
 * it never read, and every `professionalUserId` filter was commented out — so an
 * appointment id alone was enough for anyone, signed in or not, to refund a
 * booking and wipe a practitioner's calendar.
 *
 * Three things have to hold before any money moves:
 *   1. the caller is signed in as a live practitioner;
 *   2. the appointment is *theirs* — enforced in the `where`, not checked after;
 *   3. it is actually refundable, i.e. paid for and not already cancelled.
 */
const CancelAppointment = async ({
  appointmentId,
}: {
  appointmentId: string;
}) => {
  const session = await getServerAuthSession();

  // The session callback resolves `user.id` to the ProfessionalUser row, and only
  // for an account that is not soft-deleted. A missing id means no usable identity.
  if (!session?.user?.id) {
    throw new Error("Please sign in to continue");
  }

  const professionalUserId = session.user.id;

  if (!appointmentId) {
    throw new Error("Appointment not found");
  }

  try {
    // Scoped to the caller. An appointment id on its own must never be enough to
    // act on a booking.
    const appointment = await db.bookAppointment.findFirst({
      where: {
        id: appointmentId,
        professionalUserId,
      },
      select: {
        id: true,
        startingTime: true,
        status: true,
        priceInCents: true,
        totalPriceInCents: true,
        razorpayPaymentId: true,
        razorpayRefundId: true,
      },
    });

    if (!appointment) {
      logger.warn("appointment.cancel_not_owned", {
        source: "doctor-action",
        route: "CancelAppointment",
        userId: professionalUserId,
      });
      // Same message whether it does not exist or belongs to someone else, so this
      // cannot be used to probe for valid appointment ids.
      throw new Error("Appointment not found");
    }

    // Only a paid booking can be refunded. Without this, a PAYMENT_PENDING or
    // already-cancelled row would still reach `processRefund`.
    if (appointment.status !== BookAppointmentStatus.PAYMENT_SUCCESSFUL) {
      throw new Error("This appointment cannot be cancelled");
    }

    if (appointment.razorpayRefundId) {
      // Already refunded by an earlier call; do not issue a second one.
      return {
        message: "Appointment has already been cancelled with a refund",
      };
    }

    if (!appointment.razorpayPaymentId) {
      throw new Error("This appointment has no payment to refund");
    }

    const timeDifference = differenceInMinutes(
      appointment.startingTime,
      new Date(),
    );

    if (timeDifference <= 0) {
      return {
        message: "Now you can not cancel the appointment",
      };
    }

    // Refund what the patient actually paid, tax included. `priceInCents` is the
    // pre-GST base, so refunding it silently kept the tax.
    const refundAmount =
      appointment.totalPriceInCents ?? appointment.priceInCents;

    // Claim the cancellation *before* calling the gateway, and only from the paid
    // state. Two concurrent requests cannot both pass this, so only one can go on
    // to issue a refund.
    const claimed = await db.bookAppointment.updateMany({
      where: {
        id: appointment.id,
        professionalUserId,
        status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
      },
      data: {
        status: BookAppointmentStatus.CANCELLED_WITH_REFUND,
      },
    });

    if (claimed.count === 0) {
      return {
        message: "Appointment has already been cancelled",
      };
    }

    try {
      await processRefund(
        appointment.razorpayPaymentId,
        refundAmount,
        appointment.id,
      );
    } catch (refundError) {
      // Put the booking back so it is not left cancelled with the money still
      // taken, and let the practitioner see that nothing happened.
      await db.bookAppointment.updateMany({
        where: { id: appointment.id, professionalUserId },
        data: { status: BookAppointmentStatus.PAYMENT_SUCCESSFUL },
      });
      logger.error("appointment.refund_failed", {
        source: "doctor-action",
        route: "CancelAppointment",
        userId: professionalUserId,
        appointmentId: appointment.id,
        error: refundError,
      });
      throw new Error("Refund could not be processed. The appointment is unchanged.");
    }

    logger.info("appointment.cancelled_with_refund", {
      source: "doctor-action",
      userId: professionalUserId,
      appointmentId: appointment.id,
    });

    return {
      message: "Appointment has been cancelled with refund",
    };
  } catch (error) {
    // Re-thrown as-is: the client component surfaces `err.message` directly, and
    // the messages above are the ones the practitioner needs to see.
    if (error instanceof Error) {
      throw error;
    }
    logger.error("appointment.cancel_failed", {
      source: "doctor-action",
      route: "CancelAppointment",
      userId: professionalUserId,
      error,
    });
    throw new Error("Appointment cannot be cancelled");
  }
};

export default CancelAppointment;
