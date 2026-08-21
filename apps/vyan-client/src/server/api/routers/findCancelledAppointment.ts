import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  format,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { BookAppointmentStatus } from "@repo/database";
export const searchCancelledAppointmentsRouter = createTRPCRouter({
  searchCancelledAppointments: protectedProcedure
    // .input(
    //   z.object({
    //     date: z.date(),
    //     timeRange: z.enum([
    //       "1_WEEK",
    //       "1_MONTH",
    //       "3_MONTHS",
    //       "6_MONTHS",
    //       "1_YEAR",
    //     ]),
    //   }),
    // )
    .query(async ({ input, ctx }) => {
      //   const { date, timeRange } = input;

      const user = { id: ctx.session.user.id };

      // Calculate start and end dates based on the time range
      //   const yesterday = subDays(startOfDay(date), 1);
      //   const endDate = endOfDay(yesterday);
      //   let startDate;
      //   if (timeRange === "1_WEEK") {
      //     startDate = subDays(endDate, 7);
      //   } else if (timeRange === "1_MONTH") {
      //     startDate = subMonths(endDate, 1);
      //   } else if (timeRange === "3_MONTHS") {
      //     startDate = subMonths(endDate, 3);
      //   } else if (timeRange === "6_MONTHS") {
      //     startDate = subMonths(endDate, 6);
      //   } else if (timeRange === "1_YEAR") {
      //     startDate = subYears(endDate, 1);
      //   }
      //   console.log("startDate", startDate);
      try {
        const cancelledAppointments = await db.bookAppointment.findMany({
          select: {
            id: true,
            startingTime: true,
            endingTime: true,
            totalPriceInCents: true,
            patient: {
              select: {
                id: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                message: true,
                additionalPatients: true,
              },
            },
            professionalUser: {
              select: {
                id: true,
                firstName: true,
                displayQualification: {
                  select: {
                    specialization: true,
                  },
                },
              },
            },
            serviceType: true,
          },
          where: {
            userId: user?.id,
            // startingTime: {
            //   gte: startDate,
            //   lte: endDate,
            // },
            status: {
              in: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
          // The date filter above is commented out, so this returned a customer's
          // entire cancellation history unbounded. Most recent first, capped.
          orderBy: {
            startingTime: "desc",
          },
          take: 100,
        });
        console.log("cancelledAppointments", cancelledAppointments);
        return { cancelledAppointments };
      } catch (error) {
        console.log("cancelledAppointmentsError", error);
      }
    }),
});
