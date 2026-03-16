import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { unstable_cache } from "next/cache";

const getCachedSpecializations = unstable_cache(
  async () => {
    return await db.professionalSpecializations.findMany({
      select: {
        id: true,
        specialization: true,
      },
    });
  },
  ["specializations"],
  { revalidate: 3600, tags: ["specializations"] }
);

export const searchSpecializationRouter = createTRPCRouter({
  searchSpecialization: publicProcedure
    .query(async () => {
      const specializations = await getCachedSpecializations();
      return { specializations };
    }),
});

