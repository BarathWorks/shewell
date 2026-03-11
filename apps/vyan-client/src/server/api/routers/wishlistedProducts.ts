import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const wishlistedRouter = createTRPCRouter({
  wishlisted: publicProcedure.query(async ({ ctx }) => {
    // Use session from context instead of fetching again
    const wishItem = await db.user.findUnique({
      where: {
        email: ctx.session?.user.email || "",
      },
      select: {
        wishlistedProducts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return {
      wishlistedProducts: wishItem?.wishlistedProducts.map((w) => w.id),
    };
  }),
});
