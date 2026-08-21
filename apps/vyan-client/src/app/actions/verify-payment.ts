"use server";

import crypto from "crypto";
import Razorpay from "razorpay";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { finalizeBooking } from "~/lib/finalize-booking";
import { logger } from "@repo/observability";

interface IRazorPayDetails {
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Confirms an appointment payment from the browser callback.
 *
 * This function's job is to *prove the payment is real and for the right amount*.
 * Everything that follows from a confirmed payment — the earnings row, the
 * practitioner notification, the calendar event, the emails — now lives in
 * `finalizeBooking`, which the Razorpay webhook calls too. Keeping that sequence
 * here meant a booking confirmed by webhook silently skipped all of it.
 */
const VerifyPayment = async (
  { razorpay_payment_id, razorpay_signature }: IRazorPayDetails,
  order_id: string,
) => {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "User session not found" };
    }

    const user = await db.user.findFirst({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return { success: false, message: "Invalid payment signature" };
    }

    const razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderData = await razorpayInstance.orders.fetch(order_id);
    if (!orderData) {
      return { success: false, message: "Payment not completed on gateway" };
    }

    // The order must actually be paid — `amount_paid` being merely non-zero would
    // also accept a partial payment.
    if (orderData.status !== "paid") {
      return { success: false, message: "Payment not completed on gateway" };
    }

    // Scoped to the caller: an order id alone must not be enough to confirm
    // somebody else's booking.
    const appointment = await db.bookAppointment.findFirst({
      where: { razorpayOrderId: order_id, userId: user.id },
      select: {
        id: true,
        totalPriceInCents: true,
        priceInCents: true,
      },
    });

    if (!appointment) {
      return { success: false, message: "Appointment record not found" };
    }

    // The amount actually captured must equal what this appointment costs.
    // Verifying only the signature proves the payment is genuine, not that it was
    // for the right amount.
    const expectedAmount =
      appointment.totalPriceInCents ?? appointment.priceInCents;
    if (Number(orderData.amount_paid) !== Number(expectedAmount)) {
      logger.error("payment.amount_mismatch", {
        source: "verify-payment",
        appointmentId: appointment.id,
        expectedAmount,
        amountPaid: orderData.amount_paid,
      });
      return {
        success: false,
        message: "Payment amount does not match the booking",
      };
    }

    // Single shared path with the webhook — claims the transition atomically and
    // performs every downstream side effect exactly once.
    const result = await finalizeBooking({
      appointmentId: appointment.id,
      razorpayPaymentId: razorpay_payment_id,
    });

    if (result.alreadyFinalized) {
      // The webhook (or an earlier call) got there first. Still a success from the
      // customer's point of view.
      return { success: true, message: "Payment is verified" };
    }

    return {
      success: true,
      orderDetails: orderData,
      message: "Payment is verified",
    };
  } catch (error: any) {
    logger.error("payment.verify_failed", {
      source: "verify-payment",
      error,
    });
    return {
      success: false,
      message: error?.message || "Failed to verify payment",
    };
  }
};

export default VerifyPayment;
