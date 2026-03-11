import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
export const similarDoctorProfileRouter = createTRPCRouter({
  similarDoctorProfile: publicProcedure
    .input(
      z.object({
        similarDoctorProfileId: z.string(),
        displayQualificationId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { displayQualificationId, similarDoctorProfileId } = input;
      // if (!session) {
      //   throw new Error("Unauthorised");
      // }
      // if (!session.user.email) {
      //   throw new Error("Unauthorised");
      // }
      // const professionalUser = await db.professionalUser.findFirst({
      //   where: {
      //     email: session.user.email,
      //   },
      // });

      const similarDoctorProfiles = await db.professionalUser.findMany({
        select: {
          firstName: true,
          displayQualification: true,
          avgRating: true,
          totalConsultations: true,
          professionalUserAppointmentPrices: {
            select: {
              priceInCentsForSingle: true,
              priceInCentsForCouple: true,
            },
            orderBy: {
              time: "asc",
            },
          },
          ProfessionalSpecializations: true,
          userName: true,
          media: {
            select: {
              fileUrl: true,
            },
          },
          languages: {
            select: {
              id: true,
              language: true,
            },
          },
        },

        where: {
          NOT: {
            id: similarDoctorProfileId,
          },
          displayQualificationId: displayQualificationId,
        },
      });

      //   const specialisations = await db.professionalSpecializations.findMany({
      //     where : {
      //         prof
      //     }
      //   })

      //   console.log("meetingsForADayRange", meetingsForADayRange),
      // unAvailableDays,
      //   professionalUser;
      return { similarDoctorProfiles };
    }),
});
