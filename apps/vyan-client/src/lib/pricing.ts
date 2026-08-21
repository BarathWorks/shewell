import "server-only";

import { db } from "~/server/db";
import { AppError } from "@repo/observability";

/**
 * Server-authoritative pricing.
 *
 * Prices must never be taken from the request. The booking action previously
 * accepted `priceInCents` / `totalPriceInCents` straight from the browser and
 * created the Razorpay order for whatever it was sent, so any signed-in user could
 * book any consultation for ₹1 by editing the payload.
 *
 * Everything here is derived from the practitioner's configured rate and the
 * appointment's own duration. The only inputs that matter are ones the server can
 * verify.
 */

export type ResolvedPrice = {
  /** Practitioner's configured rate, in paise. */
  priceInCents: number;
  /** GST on the base rate, in paise. */
  taxedAmount: number;
  /** What the customer is charged, in paise. This is the Razorpay order amount. */
  totalPriceInCents: number;
  durationMinutes: number;
  isCouple: boolean;
};

/** GST percentage. Read server-side; the NEXT_PUBLIC_ prefix is historical. */
function gstRate(): number {
  const raw = process.env.NEXT_PUBLIC_GST;
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    // Refuse to guess: a wrong tax rate is a financial error, not a display bug.
    throw new AppError("CONFIG", "NEXT_PUBLIC_GST is missing or not a valid percentage", {
      received: raw,
    });
  }
  return parsed;
}

export function durationInMinutes(startingTime: Date, endingTime: Date): number {
  const ms = new Date(endingTime).getTime() - new Date(startingTime).getTime();
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new AppError("VALIDATION", "Appointment end time must be after its start time");
  }
  return Math.round(ms / 60000);
}

/**
 * Resolves what an appointment costs, from the database only.
 *
 * `isCouple` is derived from whether additional patients are attached, matching how
 * the couple rate is offered in the booking flow.
 */
export async function resolveAppointmentPrice(params: {
  professionalUserId: string;
  startingTime: Date;
  endingTime: Date;
  additionalPatientCount: number;
}): Promise<ResolvedPrice> {
  const durationMinutes = durationInMinutes(params.startingTime, params.endingTime);

  const configured = await db.professionalUserAppointmentPrice.findFirst({
    where: {
      professionalUserId: params.professionalUserId,
      time: durationMinutes,
    },
    select: {
      priceInCentsForSingle: true,
      priceInCentsForCouple: true,
    },
  });

  if (!configured) {
    // No configured rate for this practitioner at this duration: refuse rather than
    // fall back to a default, which would let a crafted duration set the price.
    throw new AppError("VALIDATION", "No price is configured for this appointment length", {
      professionalUserId: params.professionalUserId,
      durationMinutes,
    });
  }

  const isCouple = params.additionalPatientCount > 0;
  const priceInCents = isCouple
    ? configured.priceInCentsForCouple
    : configured.priceInCentsForSingle;

  if (!Number.isInteger(priceInCents) || priceInCents <= 0) {
    throw new AppError("CONFIG", "Configured appointment price is not a positive amount", {
      professionalUserId: params.professionalUserId,
      durationMinutes,
      isCouple,
    });
  }

  const taxedAmount = Math.round((gstRate() / 100) * priceInCents);
  const totalPriceInCents = priceInCents + taxedAmount;

  return { priceInCents, taxedAmount, totalPriceInCents, durationMinutes, isCouple };
}
