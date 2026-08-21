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
export const searchCompletedAppointmentsRouter = createTRPCRouter({
  searchCompletedAppointments: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        timeRange: z.enum([
          "1_WEEK",
          "1_MONTH",
          "3_MONTHS",
          "6_MONTHS",
          "1_YEAR",
        ]),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date, timeRange } = input;

      const user = { id: ctx.session.user.id };

      // Calculate start and end dates based on the time range
      // const yesterday = subDays(startOfDay(date), 1);
      const endDate = endOfDay(new Date(date));
      let startDate;
      if (timeRange === "1_WEEK") {
        startDate = subDays(new Date(endDate), 7);
      } else if (timeRange === "1_MONTH") {
        startDate = subMonths(new Date(endDate), 1);
      } else if (timeRange === "3_MONTHS") {
        startDate = subMonths(new Date(endDate), 3);
      } else if (timeRange === "6_MONTHS") {
        startDate = subMonths(new Date(endDate), 6);
      } else if (timeRange === "1_YEAR") {
        startDate = subYears(new Date(endDate), 1);
      }
      console.log("startDate", startDate);
      try {
        const completedAppointments = await db.bookAppointment.findMany({
          select: {
            id: true,
            startingTime: true,
            endingTime: true,
            totalPriceInCents: true,
            professionalUser: {
              select: {
                firstName: true,
                id: true,
                displayQualification: {
                  select: {
                    specialization: true,
                  },
                },
              },
            },
            serviceType: true,
            professionalRating: {
              select: {
                rating: true,
                review: true,
              },
            },
            patient: {
              select: {
                id: true,
                firstName: true,
                email: true,
                phoneNumber: true,
                message: true,
                additionalPatients: {
                  select: {
                    firstName: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
              },
            },
            status: true,
          },
          where: {
            userId: user?.id,
            startingTime: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              in: [
                BookAppointmentStatus.COMPLETED,
                BookAppointmentStatus.CANCELLED,
                // BookAppointmentStatus.PAYMENT_SUCCESSFUL,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
        });
        console.log("completedAppointments", completedAppointments);
        return { completedAppointments };
      } catch (error) {
        console.log("completedAppointmentsError", error);
      }
    }),
});
