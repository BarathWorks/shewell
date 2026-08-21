import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PUBLIC_DOCTOR } from "../bookable";
export const findDoctorbasedOnDoctorIdRouter = createTRPCRouter({
  findDoctorbasedOnDoctorId: publicProcedure
    .input(z.object({
        doctorId : z.string()
    }))
    .query(async ({ input }) => {
        const { doctorId} = input;
      const professionalUser = await db.professionalUser.findFirst({
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
        // Gated: a by-id lookup must not reach an unapproved or deleted practitioner.
        where:{
            id : doctorId,
            ...PUBLIC_DOCTOR
        }
      });
      console.log("professionalUser", professionalUser);
      return { professionalUser };
    }),
});
