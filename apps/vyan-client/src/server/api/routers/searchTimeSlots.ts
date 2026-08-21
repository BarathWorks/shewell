import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PUBLIC_DOCTOR } from "../bookable";
import { BookAppointmentStatus, Day } from "@repo/database";
import { createTimeDate, filterAvailableTimeSlots } from "~/lib/utils";
import { getHours, getMinutes, format } from "date-fns";
const { formatISO } = require("date-fns");

// converting the day of week which is number to enum type because in our model day is enum not number
const dayMapping = {
  0: Day.SUN,
  1: Day.MON,
  2: Day.TUE,
  3: Day.WED,
  4: Day.THU,
  5: Day.FRI,
  6: Day.SAT,
} as const;
export const searchTimeSlotsRouter = createTRPCRouter({
  searchTimeSlots: publicProcedure
    .input(
      z.object({
        date: z.date(),
        expertId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { date, expertId } = input;
      // The sharp end of the approval gate: this is what a booking page calls to
      // decide whether a slot exists. `findFirst`, not `findUnique` — the latter
      // only accepts unique fields, and we are filtering on more than the id.
      const professionalUser = await db.professionalUser.findFirst({
        select: { id: true },
        where: { id: expertId, ...PUBLIC_DOCTOR },
      });
      if (!professionalUser) {
        return { timeSlots: [], bookedSlots: [] };
      }

      // Find if doctor marked this specific date unavailable
      const unavailableDay = await db.unAvailableDay.findFirst({
        select: { date: true },
        where: {
          date: new Date(format(formatISO(date), "yyyy-MM-dd")),
          professionalUserId: professionalUser.id,
        },
      });
      if (unavailableDay) {
        return { timeSlots: [], bookedSlots: [] };
      }

      const dayofWeek = date.getDay();
      const dayEnum = dayMapping[dayofWeek];

      if (!dayEnum) {
        throw new Error("Invalid day of the week");
      }

      // Start and end boundaries of the selected day (UTC)
      const dayStart = new Date(date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setUTCHours(23, 59, 59, 999);

      // Run availability + booked-slots queries in parallel
      const [timeSlots, bookedSlots] = await Promise.all([
        db.availability.findMany({
          select: {
            availableTimings: {
              select: { startingTime: true, endingTime: true },
            },
          },
          where: {
            day: dayEnum,
            professionalUserId: professionalUser.id,
            available: true,
          },
        }),
        // Scope to the selected day only — prevents full-table scan
        db.bookAppointment.findMany({
          select: { startingTime: true, endingTime: true },
          where: {
            professionalUserId: professionalUser.id,
            startingTime: { gte: dayStart, lte: dayEnd },
            status: {
              notIn: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
        }),
      ]);

      const formattedBookedSlots = bookedSlots.map((item, index) => ({
        startingTime: createTimeDate(
          getHours(item.startingTime),
          getMinutes(item.startingTime),
          new Date(item.startingTime),
        ),
        endingTime: createTimeDate(
          getHours(item.endingTime),
          getMinutes(item.endingTime),
          new Date(item.endingTime),
        ),
      }));

      const formattedTimeSlots = timeSlots.map((item, index) => ({
        availableTimings: item.availableTimings.map((items) => ({
          startingTime: createTimeDate(
            getHours(items.startingTime),
            getMinutes(items.startingTime),
            date,
          ),
          endingTime: createTimeDate(
            getHours(items.endingTime),
            getMinutes(items.endingTime),
            date,
          ),
        })),
      }));

      return {
        timeSlots: formattedTimeSlots,
        bookedSlots: formattedBookedSlots,
      };
    }),
});
