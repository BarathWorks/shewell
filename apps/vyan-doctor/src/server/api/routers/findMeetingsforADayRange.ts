import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getServerSession } from "next-auth";
import { BookAppointmentStatus } from "@repo/database";
export const searchMeetingRouterForADayRange = createTRPCRouter({
  searchMeetingForADayRange: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;
      const session = await getServerSession();
      console.log("session", session);
      if(!session){
        throw new Error("Unauthorised")
      }
      if(!session.user.email){
        throw new Error("Unauthorised")
      }
      const professionalUser = await db.professionalUser.findFirst({
        where: {
          email: session.user.email,
        },
      });

      const meetingsForADayRange = await db.bookAppointment.findMany({
        where: {
          startingTime: {
            gte: startDate,
            lte: endDate,
          },
          professionalUserId: professionalUser?.id,
          status : BookAppointmentStatus.PAYMENT_SUCCESSFUL
        },
        include: {
          patient: true,
        },
      });
      const unAvailableDays = await db.unAvailableDay.findMany({
        where: {
          professionalUserId: professionalUser?.id,
        },
      });
      console.log("meetingsForADayRange", meetingsForADayRange),
        unAvailableDays,
        professionalUser;
      return { meetingsForADayRange, unAvailableDays, professionalUser };
    }),
});
