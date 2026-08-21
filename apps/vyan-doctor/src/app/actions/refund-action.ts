import "server-only";

import Razorpay from "razorpay";
import { db } from "~/server/db";
import { logger } from "@repo/observability";

/**
 * Issues a Razorpay refund and records it against the appointment.
 *
 * Deliberately not a `"use server"` module — the cancellation action that calls it
 * does the authorisation. Exporting it as a server action would make "refund this
 * payment" an endpoint in its own right.
 *
 * Mirrors the client app's `refund-payment.ts`: the amount is a number of paise
 * rather than a string, the call is idempotent on `razorpayRefundId`, and a
 * refunded consultation is taken back out of the practitioner's balance unless it
 * has already been paid out — in which case the links stay and the discrepancy is
 * flagged, because recovering money already sent is a decision for a human.
 */
export const processRefund = async (
  paymentId: string,
  amount: number,
  appointmentId: string,
) => {
  if (!paymentId) {
    throw new Error("Refund process failed");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    logger.error("refund.invalid_amount", {
      source: "refund-action",
      appointmentId,
      amount,
    });
    throw new Error("Refund process failed");
  }

  const existing = await db.bookAppointment.findUnique({
    where: { id: appointmentId },
    select: { razorpayRefundId: true },
  });

  if (existing?.razorpayRefundId) {
    logger.warn("refund.already_issued", {
      source: "refund-action",
      appointmentId,
    });
    return { refund: { id: existing.razorpayRefundId } };
  }

  const razorpayInstance = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount,
      speed: "normal",
    });

    await db.bookAppointment.update({
      data: { razorpayRefundId: refund.id },
      where: { id: appointmentId },
    });

    await reverseEarning(appointmentId);

    logger.info("refund.issued", {
      source: "refund-action",
      appointmentId,
      amount,
    });

    return { refund };
  } catch (error) {
    logger.error("refund.failed", {
      source: "refund-action",
      appointmentId,
      error,
    });
    throw new Error("Refund process failed");
  }
};

/** Takes a refunded consultation back out of the practitioner's balance. */
async function reverseEarning(appointmentId: string) {
  try {
    const earning = await db.appointmentPayment.findUnique({
      where: { appointmentId },
      select: {
        id: true,
        doctorId: true,
        payoutLinks: { select: { id: true, amountUsedInCents: true } },
      },
    });

    if (!earning) return;

    const alreadyPaidOut = earning.payoutLinks.reduce(
      (sum, link) => sum + link.amountUsedInCents,
      0,
    );

    if (alreadyPaidOut > 0) {
      logger.warn("refund.earning_already_paid_out", {
        source: "refund-action",
        appointmentId,
        doctorId: earning.doctorId,
        alreadyPaidOut,
      });
      return;
    }

    await db.$transaction(async (tx) => {
      await tx.appointmentPaymentPayout.deleteMany({
        where: { appointmentPaymentId: earning.id },
      });
      await tx.appointmentPayment.update({
        where: { id: earning.id },
        data: { paymentStatus: "PENDING" },
      });
    });
  } catch (error) {
    logger.error("refund.earning_reversal_failed", {
      source: "refund-action",
      appointmentId,
      error,
    });
  }
}
