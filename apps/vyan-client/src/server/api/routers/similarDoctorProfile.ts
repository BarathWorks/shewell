import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getPrivateFileUrl } from "@repo/aws";

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
              fileKey: true,
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

      const profilesWithSignedUrls = await Promise.all(
        similarDoctorProfiles.map(async (doctor) => {
          let signedUrl = doctor.media?.fileUrl || null;
          if (doctor.media?.fileKey) {
            try {
              const url = await getPrivateFileUrl(doctor.media.fileKey);
              if (url) signedUrl = url;
            } catch (e) {
              console.error("Error signing URL for doctor avatar:", e);
            }
          }
          return {
            ...doctor,
            media: doctor.media
              ? {
                  fileUrl: signedUrl,
                }
              : null,
          };
        })
      );

      return { similarDoctorProfiles: profilesWithSignedUrls };
    }),
});
