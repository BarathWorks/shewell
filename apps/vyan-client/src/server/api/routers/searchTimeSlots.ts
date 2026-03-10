import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getServerSession } from "next-auth";
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
      const professionalUser = await db.professionalUser.findFirst({
        select: {
          id: true,
        },
        where: {
          id: expertId,
        },
      });
      if (!professionalUser) {
        return { timeSlots: [], bookedSlots: [] };
      }

      // finding day on which doctor is unavailable comparing the date selected by user with the date marked unavailable by expert
      const unavailableDay = await db.unAvailableDay.findFirst({
        select: {
          date: true,
        },
        where: {
          date: new Date(format(formatISO(date), "yyyy-MM-dd")),
          professionalUserId: professionalUser.id,
        },
      });
      if (unavailableDay) {
        return { timeSlots: [], bookedSlots: [] };
      }

      // getting day(0: Sunday, 1: Monday ...): form the date
      // const dayofWeek = new Date(date).getUTCDay();
      const dayofWeek = date.getDay();
      const dayEnum = dayMapping[dayofWeek];

      // console.log("dayofWeek", dayofWeek, dayEnum);

      if (!dayEnum) {
        throw new Error("Invalid day of the week");
      }

      // console.log("dayofWeek Valid", dayofWeek);

      // finding time slots as per the day and selected expert
      const timeSlots = await db.availability.findMany({
        select: {
          availableTimings: {
            select: {
              startingTime: true,
              endingTime: true,
            },
          },
        },
        where: {
          day: dayEnum,
          professionalUserId: professionalUser?.id,
          available: true,
        },
      });

      const bookedSlots = await db.bookAppointment.findMany({
        select: {
          startingTime: true,
          endingTime: true,
        },
        where: {
          professionalUserId: professionalUser.id,
          status: {
            notIn: [
              BookAppointmentStatus.CANCELLED,
              BookAppointmentStatus.CANCELLED_WITH_REFUND,
            ],
          },
        },
      });

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
