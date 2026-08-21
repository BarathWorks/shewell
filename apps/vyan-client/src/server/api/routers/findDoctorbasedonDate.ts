import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PUBLIC_DOCTOR } from "../bookable";
import { Prisma } from "@repo/database";
export const DoctorRouter = createTRPCRouter({
  Doctor: publicProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;

      const professionalUser = await db.professionalUser.findMany({
        select: {
          id: true,
          firstName: true,
          displayQualification: {
            select: {
              specialization: true,
            },
          },
          avgRating: true,
          totalConsultations: true,
          userName: true,
          // professionalUserAppointmentPrices: {
          //   select: {
          //     priceInCents: true,
          //   },
          // },
        },
        where: {
          unavailableDay: {
            none: {
              date: date,
            },
          },
          ...PUBLIC_DOCTOR,
        },
      });
      console.log("professionalUserbasedonDate", professionalUser);
      return { professionalUser };
    }),
});
