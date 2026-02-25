import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const getTopExpertsRouter = createTRPCRouter({
  getTopExperts: publicProcedure.query(async () => {
    const topExperts = await db.professionalUser.findMany({
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
      take: 5,
    });

    return { topExperts };
  }),
});
