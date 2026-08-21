"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookAppointmentStatus } from "@repo/database";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { logger } from "@repo/observability";

/**
 * Records a patient's review of a completed consultation.
 *
 * Two separate problems, which had to be fixed together.
 *
 * **It never worked.** The schema declared `rating: z.string()` while the form
 * sends a number, so `safeParse` failed on every legitimate submission and the
 * action returned `{ error: "Data is invalid" }`. The caller reads `resp?.message`,
 * which was undefined, so the patient saw an empty toast and no review was ever
 * written.
 *
 * **Fixing that alone would have opened a hole.** Nothing checked that
 * `bookAppointmentId` belonged to the caller, that the appointment had actually
 * happened, or that `rating` was within 1–5 before it fed the practitioner's
 * `avgRating`. Correcting the type without adding those would have turned a dead
 * endpoint into a live one that let any account write reviews against any
 * practitioner and set the average to any number it liked.
 */
const schema = z.object({
  // Was `z.string()`. The form sends a number, and the value goes into an `Int`
  // column that feeds an average — so it is bounded here, not just typed.
  rating: z
    .number({ required_error: "Please select a rating" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  review: z
    .string({ required_error: "Please add a review" })
    .trim()
    .min(1, "Please add a review")
    .max(2000, "Please keep the review under 2000 characters"),
  professionalUserId: z.string().min(1),
  bookAppointmentId: z.string().min(1),
});

const AddReviewRatingUserAction = async ({
  review,
  rating,
  professionalUserId,
  bookAppointmentId,
}: {
  review: string | undefined;
  rating: number | undefined;
  professionalUserId: string;
  bookAppointmentId: string;
}) => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  const parsed = schema.safeParse({
    review,
    rating,
    professionalUserId,
    bookAppointmentId,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data is invalid" };
  }

  const data = parsed.data;

  try {
    // The appointment must be the caller's own, must have been with the
    // practitioner being reviewed, and must actually have taken place. All three in
    // the `where`, so none of them can be satisfied by a crafted id.
    const appointment = await db.bookAppointment.findFirst({
      where: {
        id: data.bookAppointmentId,
        userId,
        professionalUserId: data.professionalUserId,
        status: BookAppointmentStatus.COMPLETED,
      },
      select: { id: true, professionalUserId: true },
    });

    if (!appointment) {
      logger.warn("review.appointment_not_eligible", {
        source: "client-action",
        route: "AddReviewRatingUserAction",
        userId,
      });
      return {
        error: "You can only review a consultation you have completed",
      };
    }

    // One review per appointment. `bookAppointmentId` is unique on the model, so
    // the create below would fail anyway — this turns that into a clear message.
    const existingRating = await db.professionalUserRating.findFirst({
      where: { bookAppointmentId: appointment.id },
      select: { id: true },
    });

    if (existingRating) {
      return { error: "You have already reviewed this consultation" };
    }

    await db.professionalUserRating.create({
      data: {
        rating: data.rating,
        review: data.review,
        professionalUserId: appointment.professionalUserId,
        bookAppointmentId: appointment.id,
      },
    });

    const avgRating = await db.professionalUserRating.aggregate({
      _avg: { rating: true },
      where: { professionalUserId: appointment.professionalUserId },
    });

    if (avgRating._avg.rating !== null) {
      await db.professionalUser.update({
        data: { avgRating: avgRating._avg.rating },
        where: { id: appointment.professionalUserId },
      });
    }

    revalidatePath("/profile/appointments");

    logger.info("review.created", {
      source: "client-action",
      userId,
      appointmentId: appointment.id,
    });

    return { message: "Ratings updated successfully" };
  } catch (error) {
    logger.error("review.create_failed", {
      source: "client-action",
      route: "AddReviewRatingUserAction",
      userId,
      error,
    });
    return { error: "Cannot add the ratings" };
  }
};

export default AddReviewRatingUserAction;
