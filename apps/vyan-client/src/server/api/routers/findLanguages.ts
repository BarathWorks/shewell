import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { unstable_cache } from "next/cache";

const getCachedLanguages = unstable_cache(
  async () => {
    return await db.professionalLanguages.findMany({
      select: {
        id: true,
        language: true,
      },
    });
  },
  ["languages"],
  { revalidate: 3600, tags: ["languages"] }
);

export const searchLanguagesRouter = createTRPCRouter({
  searchLanguage: publicProcedure
    .query(async () => {
      const languages = await getCachedLanguages();
      return { languages };
    }),
});

