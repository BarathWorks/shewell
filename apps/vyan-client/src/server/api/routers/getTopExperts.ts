import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getPrivateFileUrl } from "@repo/aws";

export const getTopExpertsRouter = createTRPCRouter({
  getTopExperts: publicProcedure.query(async () => {
    let topExperts = await db.professionalUser.findMany({
      where: {
        AND: [{ isapproved: true }, { deletedAt: null }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        media: {
          select: {
            fileUrl: true,
            fileKey: true,
          },
        },
        displayQualification: {
          select: {
            specialization: true,
          },
        },
      },
      orderBy: {
        avgRating: "desc",
      },
      take: 10,
    });

    if (topExperts.length === 0) {
      topExperts = await db.professionalUser.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          media: {
            select: {
              fileUrl: true,
              fileKey: true,
            },
          },
          displayQualification: {
            select: {
              specialization: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });
    }

    const topExpertsWithSignedUrls = await Promise.all(
      topExperts.map(async (doctor) => {
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

    return { topExperts: topExpertsWithSignedUrls };
  }),
});
