import "server-only";

import { BookAppointmentStatus } from "@repo/database";
import { format } from "date-fns";
import { sendEmail } from "@repo/mail";
import { logger } from "@repo/observability";

import { db } from "~/server/db";
import { createEvent } from "~/lib/create-event";
import {
  getAppointmentBookingEmailTemplate,
  getDoctorAppointmentBookingEmailTemplate,
} from "~/lib/email-templates";

/**
 * Everything that must happen once an appointment's payment is confirmed.
 *
 * There are two paths to a confirmed payment and they were not equivalent. The
 * browser callback (`verify-payment.ts`) created the `AppointmentPayment` earnings
 * row, the practitioner notification, the Google Calendar event and both
 * confirmation emails. The Razorpay webhook — which exists *precisely* for the case
 * where the browser never comes back — only flipped the status.
 *
 * Since `AppointmentPayment` is the sole input to the earnings and payout system,
 * a booking confirmed by webhook was one the practitioner would never be paid for,
 * on exactly the flaky-network cases the webhook was added to cover. The patient
 * got no confirmation and no meeting link either.
 *
 * Both paths now call this. The caller's only job is to prove the payment is real
 * — signature, gateway status, amount — and then hand over.
 *
 * Two properties this has to hold:
 *
 *   - **Exactly one caller does the work.** The status transition is a conditional
 *     `updateMany`, so if the webhook and the browser arrive together only one wins
 *     and only one set of emails is sent.
 *
 *   - **The earnings row is ensured either way.** It is written even when this call
 *     lost the race, because the winner may have died between claiming the status
 *     and recording the earning — and nothing would ever retry, the status now
 *     being final. An `upsert` on the unique `appointmentId` makes that safe to
 *     repeat.
 *
 * Nothing after the claim may throw: a failed email must not cost the practitioner
 * their earnings row, and must not make the webhook return 500 and be retried
 * forever against an already-confirmed booking.
 */

/** Practitioner's share of the gross amount. */
const DOCTOR_SHARE = 0.8;

export type FinalizeBookingResult = {
  /** True when this call performed the transition rather than losing the race. */
  finalized: boolean;
  /** True when the booking was already PAYMENT_SUCCESSFUL. */
  alreadyFinalized: boolean;
  /** Present when a calendar event was created on this call. */
  meetingLink?: string;
};

export async function finalizeBooking({
  appointmentId,
  razorpayPaymentId,
}: {
  appointmentId: string;
  razorpayPaymentId?: string;
}): Promise<FinalizeBookingResult> {
  // Atomic transition. A read-then-write here let two concurrent confirmations
  // both pass the idempotency check and both create earnings rows.
  const claimed = await db.bookAppointment.updateMany({
    where: {
      id: appointmentId,
      status: { not: BookAppointmentStatus.PAYMENT_SUCCESSFUL },
    },
    data: {
      status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
      ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
    },
  });

  const wonTheRace = claimed.count > 0;

  const appointment = await db.bookAppointment.findUnique({
    where: { id: appointmentId },
    include: {
      professionalUser: true,
      patient: true,
    },
  });

  if (!appointment) {
    logger.error("booking.finalize_missing_appointment", {
      source: "finalize-booking",
      appointmentId,
    });
    return { finalized: false, alreadyFinalized: false };
  }

  // Runs on both paths — see the note above about a winner that died early.
  await ensureAppointmentPayment(appointment);

  if (!wonTheRace) {
    return { finalized: false, alreadyFinalized: true };
  }

  const doctorName =
    `${appointment.professionalUser.firstName ?? ""} ${appointment.professionalUser.lastName ?? ""}`.trim() ||
    "Doctor";
  const appointmentTime = `${format(appointment.startingTime, "hh:mm a")} - ${format(appointment.endingTime, "hh:mm a")}`;

  await notifyPractitioner(appointment, doctorName);

  const meetingLink = await createMeeting(appointment);

  await sendConfirmationEmails(appointment, {
    doctorName,
    appointmentTime,
    meetingLink,
  });

  logger.info("booking.finalized", {
    source: "finalize-booking",
    appointmentId: appointment.id,
    hasMeetingLink: Boolean(meetingLink),
  });

  return { finalized: true, alreadyFinalized: false, meetingLink };
}

/**
 * Records the practitioner's earning for this appointment.
 *
 * `upsert` on the unique `appointmentId`, so calling it twice is harmless — which
 * is what lets both confirmation paths call it unconditionally.
 */
async function ensureAppointmentPayment(appointment: {
  id: string;
  professionalUserId: string;
  totalPriceInCents: number | null;
  priceInCents: number;
}) {
  try {
    const totalAmount = appointment.totalPriceInCents ?? appointment.priceInCents;
    const doctorShareInCents = Math.floor(totalAmount * DOCTOR_SHARE);
    const platformShareInCents = totalAmount - doctorShareInCents;

    await db.appointmentPayment.upsert({
      where: { appointmentId: appointment.id },
      create: {
        appointmentId: appointment.id,
        doctorId: appointment.professionalUserId,
        totalAmountInCents: totalAmount,
        doctorShareInCents,
        platformShareInCents,
        paymentStatus: "PENDING",
      },
      // Nothing to change on a repeat call. Amounts are deliberately not rewritten:
      // the row may already be linked to a payout.
      update: {},
    });
  } catch (error) {
    // Loud, because this is the row the practitioner is paid from.
    logger.error("booking.earnings_row_failed", {
      source: "finalize-booking",
      appointmentId: appointment.id,
      error,
    });
  }
}

async function notifyPractitioner(
  appointment: {
    professionalUserId: string;
    serviceType: string;
    startingTime: Date;
    patient: { firstName: string };
  },
  _doctorName: string,
) {
  try {
    await db.professionalNotification.create({
      data: {
        title: "New Appointment Booked",
        description: `You have a new ${appointment.serviceType} appointment with ${appointment.patient.firstName} on ${appointment.startingTime.toLocaleDateString()} at ${appointment.startingTime.toLocaleTimeString()}.`,
        professionalUserId: appointment.professionalUserId,
        time: new Date(),
      },
    });
  } catch (error) {
    logger.error("booking.notification_failed", {
      source: "finalize-booking",
      error,
    });
  }
}

/** Creates the Google Calendar event, when the practitioner has connected Google. */
async function createMeeting(appointment: {
  id: string;
  professionalUserId: string;
  startingTime: Date;
  endingTime: Date;
  planName: string;
  description: string | null;
  professionalUser: {
    googleAccessToken: string | null;
    googleRefreshToken: string | null;
  };
  patient: { firstName: string; lastName: string | null; email: string };
}): Promise<string> {
  const connected =
    appointment.professionalUser.googleAccessToken ||
    appointment.professionalUser.googleRefreshToken;

  if (!connected) return "";

  try {
    const patientName =
      `${appointment.patient.firstName} ${appointment.patient.lastName ?? ""}`.trim();

    const eventResult = await createEvent({
      professionalUserId: appointment.professionalUserId,
      appointmentId: appointment.id,
      startTime: appointment.startingTime,
      endTime: appointment.endingTime,
      patientName,
      patientEmail: appointment.patient.email,
      planName: appointment.planName,
      description: appointment.description ?? "",
    });

    return eventResult?.hangoutLink ?? "";
  } catch (error) {
    logger.error("booking.calendar_event_failed", {
      source: "finalize-booking",
      appointmentId: appointment.id,
      error,
    });
    return "";
  }
}

async function sendConfirmationEmails(
  appointment: {
    startingTime: Date;
    planName: string;
    serviceType: string;
    patient: { firstName: string; email: string };
    professionalUser: { email: string | null };
  },
  {
    doctorName,
    appointmentTime,
    meetingLink,
  }: { doctorName: string; appointmentTime: string; meetingLink: string },
) {
  try {
    const patientEmailTemplate = getAppointmentBookingEmailTemplate({
      userName: appointment.patient.firstName,
      userEmail: appointment.patient.email,
      doctorName,
      appointmentDate: appointment.startingTime,
      appointmentTime,
      planName: appointment.planName,
      serviceType: appointment.serviceType,
      meetingLink,
    });

    await sendEmail({
      from: process.env.FROM_EMAIL!,
      to: [appointment.patient.email],
      subject: patientEmailTemplate.subject,
      html: patientEmailTemplate.html,
    });
  } catch (error) {
    logger.error("booking.patient_email_failed", {
      source: "finalize-booking",
      error,
    });
  }

  if (!appointment.professionalUser.email) return;

  try {
    const doctorEmailTemplate = getDoctorAppointmentBookingEmailTemplate({
      doctorName,
      patientName: appointment.patient.firstName,
      appointmentDate: appointment.startingTime,
      appointmentTime,
      planName: appointment.planName,
      serviceType: appointment.serviceType,
      meetingLink,
    });

    await sendEmail({
      from: process.env.FROM_EMAIL!,
      to: [appointment.professionalUser.email],
      subject: doctorEmailTemplate.subject,
      html: doctorEmailTemplate.html,
    });
  } catch (error) {
    logger.error("booking.doctor_email_failed", {
      source: "finalize-booking",
      error,
    });
  }
}
