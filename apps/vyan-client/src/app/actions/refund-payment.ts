import "server-only";

import Razorpay from "razorpay";
import { db } from "~/server/db";
import { logger } from "@repo/observability";

/**
 * Issues a Razorpay refund and records it against the appointment.
 *
 * Deliberately not a `"use server"` module — it is called by the cancellation
 * actions, which do the authorisation. Exporting it as a server action would make
 * "refund this payment" an endpoint of its own.
 *
 * Three corrections:
 *
 *   - **Amount is a number of paise, not a string.** It was passed as
 *     `amount.toString()`.
 *
 *   - **Idempotent.** There was no guard at all, so a repeated call issued a second
 *     refund against the same payment. The callers now claim the cancellation
 *     before calling this, and this checks `razorpayRefundId` as a second line.
 *
 *   - **A refunded earning no longer strands its payout links.** Setting the
 *     `AppointmentPayment` back to PENDING removes it from the practitioner's
 *     earnings total, but any `AppointmentPaymentPayout` rows stayed — so the
 *     amount remained in the paid-out total and the available balance
 *     (`earnings − payouts`) could go negative with no way to reconcile it. If the
 *     earning was never paid out the links are removed with it; if it *was*, the
 *     row is left alone and flagged, because clawing back money already sent is a
 *     decision for a human.
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
      source: "refund-payment",
      appointmentId,
      amount,
    });
    throw new Error("Refund process failed");
  }

  // Second line of defence behind the caller's conditional status claim.
  const existing = await db.bookAppointment.findUnique({
    where: { id: appointmentId },
    select: { razorpayRefundId: true },
  });

  if (existing?.razorpayRefundId) {
    logger.warn("refund.already_issued", {
      source: "refund-payment",
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
      source: "refund-payment",
      appointmentId,
      amount,
    });

    return { refund };
  } catch (error) {
    logger.error("refund.failed", {
      source: "refund-payment",
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
      // The practitioner has already been paid for this consultation. Removing the
      // links would silently reopen that money for a second payout; leaving the
      // earning COMPLETED keeps the ledger consistent. Someone has to decide how to
      // recover it.
      logger.warn("refund.earning_already_paid_out", {
        source: "refund-payment",
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
    // The refund itself already succeeded; never fail the caller on this.
    logger.error("refund.earning_reversal_failed", {
      source: "refund-payment",
      appointmentId,
      error,
    });
  }
}
