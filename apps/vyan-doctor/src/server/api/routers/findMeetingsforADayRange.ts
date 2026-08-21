import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { BookAppointmentStatus } from "@repo/database";

/**
 * The practitioner's own bookings across a date range, plus the days they have
 * marked unavailable.
 *
 * Two things were wrong here.
 *
 * 1. It returned `professionalUser` as an unselected row, so every dashboard load
 *    shipped the practitioner's `passwordHash`, `googleAccessToken`,
 *    `googleRefreshToken`, bank account number and IFSC code to the browser. A
 *    bcrypt hash in the client is offline-crackable the moment it is logged or
 *    cached; a Google *refresh* token is worse, because it grants calendar access
 *    that outlives this application's session entirely.
 *
 * 2. Appointments were returned as unselected rows too, carrying `razorpayOrderId`,
 *    `razorpayPaymentId` and `razorpayRefundId` — payment identifiers the calendar
 *    UI has no use for.
 *
 * Everything below is an explicit `select`. New columns on either model — and this
 * schema gains them regularly — are not exposed by default.
 */
export const searchMeetingRouterForADayRange = createTRPCRouter({
  searchMeetingForADayRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { startDate, endDate } = input;

      // `protectedProcedure` guarantees this is present, and the session callback
      // only sets it for a practitioner account that is not soft-deleted.
      const professionalUserId = ctx.session.user.id;

      const [professionalUser, meetingsForADayRange, unAvailableDays] =
        await Promise.all([
          db.professionalUser.findFirst({
            where: { id: professionalUserId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              email: true,
              // The calendar uses this as the earliest selectable month.
              createdAt: true,
            },
          }),
          db.bookAppointment.findMany({
            where: {
              startingTime: {
                gte: startDate,
                lte: endDate,
              },
              professionalUserId,
              status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
            },
            select: {
              id: true,
              startingTime: true,
              endingTime: true,
              status: true,
              serviceType: true,
              planName: true,
              description: true,
              meeting: true,
              patientId: true,
            },
          }),
          db.unAvailableDay.findMany({
            where: { professionalUserId },
            select: {
              id: true,
              date: true,
              professionalUserId: true,
            },
          }),
        ]);

      return { meetingsForADayRange, unAvailableDays, professionalUser };
    }),
});
