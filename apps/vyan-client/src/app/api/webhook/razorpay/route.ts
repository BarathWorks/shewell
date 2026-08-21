import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { BookAppointmentStatus } from "@repo/database";
import { db } from "~/server/db";
import { captureException, logger, AppError } from "@repo/observability";
import { finalizeBooking } from "~/lib/finalize-booking";

/**
 * Razorpay webhook.
 *
 * Client-side verification alone is not enough: if the customer closes the tab
 * between paying and the browser calling back, the money is captured but the
 * booking stays PAYMENT_PENDING forever. Razorpay retries this endpoint, so it is
 * the authoritative confirmation path.
 *
 * Configure in the Razorpay dashboard against `/api/webhook/razorpay` with events
 * `payment.captured` and `order.paid`, and set RAZORPAY_WEBHOOK_SECRET.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Constant-time compare so a signature cannot be recovered by timing the response. */
function signatureMatches(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type RazorpayEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } };
    order?: { entity?: { id?: string; amount_paid?: number; status?: string } };
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    // Fail closed. Accepting unverified callbacks would let anyone mark bookings paid.
    captureException(
      new AppError("CONFIG", "RAZORPAY_WEBHOOK_SECRET is not set; webhook rejected"),
      { source: "razorpay-webhook" }
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // The signature covers the exact bytes received, so hash the raw body before
  // any JSON parsing.
  const rawBody = await req.text();
  const received = req.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (!received || !signatureMatches(expected, received)) {
    logger.warn("razorpay.webhook_bad_signature", {
      source: "razorpay-webhook",
      hasSignature: Boolean(received),
    });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayEvent;
  } catch (error) {
    captureException(error, { source: "razorpay-webhook", stage: "parse" });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = event.event ?? "unknown";
  const payment = event.payload?.payment?.entity;
  const order = event.payload?.order?.entity;

  const orderId = payment?.order_id ?? order?.id;
  const amountPaid = order?.amount_paid ?? payment?.amount;

  if (!orderId) {
    logger.warn("razorpay.webhook_no_order", { source: "razorpay-webhook", event: name });
    return NextResponse.json({ ok: true });
  }

  try {
    if (name === "payment.captured" || name === "order.paid") {
      await finalizeAppointment(orderId, Number(amountPaid), payment?.id);
      await finalizeSessionRegistration(orderId, Number(amountPaid), payment?.id);
    } else {
      logger.info("razorpay.webhook_ignored", { source: "razorpay-webhook", event: name });
    }
  } catch (error) {
    captureException(error, { source: "razorpay-webhook", event: name, orderId });
    // 500 asks Razorpay to retry, which is what we want for a transient failure.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Always acknowledge a verified event we have handled, so Razorpay stops retrying.
  return NextResponse.json({ ok: true });
}

async function finalizeAppointment(orderId: string, amountPaid: number, paymentId?: string) {
  const appointment = await db.bookAppointment.findFirst({
    where: { razorpayOrderId: orderId },
    select: { id: true, status: true, totalPriceInCents: true, priceInCents: true },
  });

  if (!appointment) return;

  const expected = appointment.totalPriceInCents ?? appointment.priceInCents;
  if (Number.isFinite(amountPaid) && Number(amountPaid) !== Number(expected)) {
    // Never confirm a booking that was underpaid — flag it for a human instead.
    captureException(
      new AppError("PAYMENT", "Webhook amount does not match booking", {
        appointmentId: appointment.id,
        expected,
        amountPaid,
      }),
      { source: "razorpay-webhook" }
    );
    return;
  }

  // The same path the browser callback takes.
  //
  // This used to be a bare status update. Everything that actually follows from a
  // confirmed payment — the AppointmentPayment earnings row, the practitioner
  // notification, the Google Calendar event, both confirmation emails — happened
  // only in `verify-payment.ts`. So a booking confirmed here, which is to say every
  // booking where the customer closed the tab before the callback ran, left the
  // practitioner unpaid and the patient uninformed. That is the exact case this
  // endpoint exists to cover.
  //
  // `finalizeBooking` claims the transition atomically, so the browser callback
  // arriving at the same moment cannot double up.
  const result = await finalizeBooking({
    appointmentId: appointment.id,
    razorpayPaymentId: paymentId,
  });

  if (result.finalized) {
    logger.info("razorpay.appointment_confirmed", {
      source: "razorpay-webhook",
      appointmentId: appointment.id,
    });
  }
}

async function finalizeSessionRegistration(orderId: string, amountPaid: number, paymentId?: string) {
  const registration = await db.sessionRegistration.findFirst({
    where: { razorpayOrderId: orderId },
    select: { id: true, amountPaid: true, paymentStatus: true },
  });

  if (!registration) return;

  const expectedInPaise = Math.round(Number(registration.amountPaid) * 100);
  if (Number.isFinite(amountPaid) && Number(amountPaid) !== expectedInPaise) {
    captureException(
      new AppError("PAYMENT", "Webhook amount does not match session registration", {
        registrationId: registration.id,
        expectedInPaise,
        amountPaid,
      }),
      { source: "razorpay-webhook" }
    );
    return;
  }

  const claimed = await db.sessionRegistration.updateMany({
    where: { id: registration.id, paymentStatus: { not: "COMPLETED" } },
    data: {
      paymentStatus: "COMPLETED",
      ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
    },
  });

  if (claimed.count > 0) {
    logger.info("razorpay.session_confirmed", {
      source: "razorpay-webhook",
      registrationId: registration.id,
    });
  }
}
