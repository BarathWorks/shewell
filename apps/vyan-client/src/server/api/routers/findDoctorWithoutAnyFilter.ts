import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PUBLIC_DOCTOR } from "../bookable";
export const findDoctorWithoutFilterRouter = createTRPCRouter({
  findDoctorWithoutFilter: publicProcedure
    .input(
      z.object({
        take: z.number().min(1).max(100).default(20),
        skip: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const professionalUser = await db.professionalUser.findMany({
        where: {
          ...PUBLIC_DOCTOR,
        },
        select: {
          id: true,
          firstName: true,
          displayQualification: {
            select: { specialization: true },
          },
          avgRating: true,
          totalConsultations: true,
          userName: true,
          professionalUserAppointmentPrices: {
            select: { priceInCentsForSingle: true },
            take: 1,
            orderBy: { priceInCentsForSingle: "asc" },
          },
        },
        orderBy: { avgRating: "desc" },
        take: input.take,
        skip: input.skip,
      });
      return { professionalUser };
    }),
});
