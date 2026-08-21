"use server";

import { getServerAuthSession } from "~/server/auth";
import Razorpay from "razorpay";
import { db } from "~/server/db";
import { AppointmentType, BookAppointmentStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { resolveAppointmentPrice } from "~/lib/pricing";
import { PUBLIC_DOCTOR } from "~/server/api/bookable";
import { logger } from "@repo/observability";

interface IBookAppointmentDetailsProps {
  serviceMode: {
    serviceType: AppointmentType;
    description: string;
    planName: string;
    /**
     * Accepted for backwards compatibility with existing callers and ignored.
     * Prices are resolved server-side; see `~/lib/pricing`.
     */
    taxedAmount?: number;
    totalPriceInCents?: number;
    priceInCents?: number;
  };
  professionalUser: {
    professionalUserId: string;
  };
  patient: {
    id: string;
    firstName: string;
    email: string;
    phoneNumber: string;
    message: string;
    additionalPatients: {
      firstName: string;
      email: string;
      phoneNumber: string;
    }[];
  };
  startingTime: Date;
  endingTime: Date;
}

/**
 * Creates a pending appointment and the Razorpay order to pay for it.
 *
 * Split into three phases, because the previous single-transaction version called
 * `orders.create` from *inside*
 * `db.$transaction(…, { isolationLevel: "Serializable", timeout: 10000 })`.
 *
 * Two problems with that. The mild one: a serializable transaction was held open
 * across a third-party HTTPS round trip on every booking, so gateway latency became
 * database lock time.
 *
 * The one that mattered: if the order was created and the transaction then rolled
 * back — timeout, serialization conflict, a failing update — Razorpay held a
 * payable order whose appointment row did not exist. The customer could still pay
 * it, and both the webhook and `verify-payment` resolve an appointment *by order
 * id*, so neither could ever reconcile it. Money in, nothing to attach it to, no
 * automated recovery.
 *
 * Now:
 *   1. Validate and reserve, in a short database-only transaction.
 *   2. Create the order outside it.
 *   3. Attach the order id.
 *
 * If step 2 or 3 fails, the reservation from step 1 is released so it does not hold
 * the practitioner's slot. And the order now carries the appointment id in both
 * `receipt` and `notes`, so an orphan is traceable back to its booking by hand.
 *
 * `createSessionOrder` in `~/lib/payment-actions` already used this shape; this
 * brings appointment checkout in line with it.
 */
async function CheckoutAction({
  serviceMode,
  professionalUser,
  patient,
  startingTime,
  endingTime,
}: IBookAppointmentDetailsProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return { error: "Unauthorised" };
  }

  const user = await db.user.findFirst({
    where: { id: session.user.id, deletedAt: null },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (
    !serviceMode ||
    !professionalUser ||
    !patient ||
    !startingTime ||
    !endingTime
  ) {
    return { error: "Incomplete data for booking appointment" };
  }

  // ── Phase 1: validate and reserve the slot. Database only, no network calls.
  let reservation:
    | { appointmentId: string; amountInPaise: number }
    | { error: string };

  try {
    reservation = await db.$transaction(
      async (tx) => {
        // Check if the timeslot is already booked
        const existingAppointment = await tx.bookAppointment.findFirst({
          where: {
            professionalUserId: professionalUser.professionalUserId,
            startingTime: startingTime,
            status: {
              notIn: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
          select: { id: true },
        });

        if (existingAppointment) {
          return {
            error:
              "This timeslot is already booked. Please select a different time.",
          };
        }

        // The patient id arrives from the browser, so confirm it belongs to the
        // caller. Without this a signed-in user could attach a booking to somebody
        // else's patient record.
        const ownedPatient = await tx.patient.findFirst({
          where: { id: patient.id, userId: user.id, deletedAt: null },
          select: { id: true, _count: { select: { additionalPatients: true } } },
        });

        if (!ownedPatient) {
          return { error: "Patient not found" };
        }

        // The practitioner id also arrives from the browser. Approval is the
        // credential check for this product, so it has to hold at the point a
        // booking is created — not only where practitioners are listed.
        const bookableDoctor = await tx.professionalUser.findFirst({
          where: { id: professionalUser.professionalUserId, ...PUBLIC_DOCTOR },
          select: { id: true },
        });

        if (!bookableDoctor) {
          return { error: "This practitioner is not available for booking" };
        }

        // Resolved from the practitioner's configured rate and the appointment's
        // own duration. Anything the client sent about money is discarded.
        const price = await resolveAppointmentPrice({
          professionalUserId: professionalUser.professionalUserId,
          startingTime,
          endingTime,
          additionalPatientCount: ownedPatient._count.additionalPatients,
        });

        const bookAppointment = await tx.bookAppointment.create({
          data: {
            endingTime: endingTime,
            startingTime: startingTime,
            description: serviceMode.description,
            planName: serviceMode.description,
            priceInCents: price.priceInCents,
            taxedAmount: price.taxedAmount,
            totalPriceInCents: price.totalPriceInCents,
            serviceType: serviceMode.serviceType,
            patientId: ownedPatient.id,
            professionalUserId: professionalUser.professionalUserId,
            status: BookAppointmentStatus.PAYMENT_PENDING,
            userId: user.id,
          },
          select: { id: true },
        });

        return {
          appointmentId: bookAppointment.id,
          amountInPaise: price.totalPriceInCents,
        };
      },
      {
        // Short now: this transaction does nothing but read and write our own rows.
        timeout: 10000,
        isolationLevel: "Serializable",
      },
    );
  } catch (error) {
    logger.error("checkout.reserve_failed", { source: "checkout-action", error });
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to Book the appointment" };
  }

  if ("error" in reservation) {
    return reservation;
  }

  const { appointmentId, amountInPaise } = reservation;

  // ── Phase 2: create the order at Razorpay, outside the transaction.
  let order: { id: string; amount: string | number };

  try {
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    order = await instance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      // Both carry the appointment id so an order that ends up orphaned can still
      // be traced back to its booking without guesswork.
      receipt: appointmentId.slice(0, 40),
      notes: { bookAppointmentId: appointmentId },
    });
  } catch (error) {
    await releaseReservation(appointmentId, user.id, "order_create_failed", error);
    return { error: "Could not start the payment. Please try again." };
  }

  // ── Phase 3: attach the order id.
  try {
    await db.bookAppointment.updateMany({
      where: { id: appointmentId, userId: user.id },
      data: { razorpayOrderId: order.id },
    });
  } catch (error) {
    // The order exists but we cannot resolve it later, which is precisely the
    // orphan case. Release the slot and make the customer start again rather than
    // let them pay against a booking nothing can find.
    await releaseReservation(appointmentId, user.id, "order_attach_failed", error);
    return { error: "Could not start the payment. Please try again." };
  }

  revalidatePath("/profile/appointments");

  return {
    message: "Appointment has booked",
    user: {
      name: user.name,
      email: user.email,
    },
    name: "Vyan",
    currency: "INR",
    amount: order.amount,
    orderId: order.id,
    description: "",
    image: "",
  };
}

/**
 * Frees a reservation whose payment could never be started.
 *
 * Cancelling rather than deleting: the row is the only evidence that this happened,
 * and CANCELLED is already excluded from the slot-conflict check, so the time
 * becomes bookable again immediately.
 */
async function releaseReservation(
  appointmentId: string,
  userId: string,
  reason: string,
  error: unknown,
) {
  logger.error("checkout.reservation_released", {
    source: "checkout-action",
    appointmentId,
    reason,
    error,
  });

  try {
    await db.bookAppointment.updateMany({
      where: {
        id: appointmentId,
        userId,
        status: BookAppointmentStatus.PAYMENT_PENDING,
      },
      data: { status: BookAppointmentStatus.CANCELLED },
    });
  } catch (releaseError) {
    logger.error("checkout.reservation_release_failed", {
      source: "checkout-action",
      appointmentId,
      error: releaseError,
    });
  }
}

export default CheckoutAction;
