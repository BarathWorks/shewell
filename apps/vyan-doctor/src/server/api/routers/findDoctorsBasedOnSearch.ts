import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@repo/database";

/**
 * Practitioner search behind the header's search box.
 *
 * Two things were wrong with this, and together they made it the worst endpoint in
 * the portal.
 *
 * **It was a `publicProcedure` with no session check.** Every other router in this
 * app either uses `protectedProcedure` or calls `getServerAuthSession` itself; this
 * one did neither, so it answered any unauthenticated request to
 * `/api/trpc/findDoctorsBasedOnSearch.findDoctorsBasedOnSearch`.
 *
 * **It selected nothing, so it returned everything.** `findMany({ where })` with no
 * projection returns every column on the model — which for ProfessionalUser means
 * `passwordHash`, `bankAccountNumber`, `bankIfscCode`, `bankUpiId`, the Google OAuth
 * tokens, the pending `otp`, phone number and date of birth. All of it, to anyone
 * who asked.
 *
 * Now: authenticated only, an explicit projection of the four fields the search
 * dropdown actually renders, soft-deleted practitioners excluded, and a bound on
 * the result count. The `console.log` that printed the whole result set — password
 * hashes included — to the server log is gone too.
 */
export const findDoctorsBasedOnSearchRouter = createTRPCRouter({
  findDoctorsBasedOnSearch: protectedProcedure
    .input(
      z.object({
        inputSearch: z.string().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const { inputSearch } = input;

      const whereCondition: Prisma.ProfessionalUserWhereInput = {
        deletedAt: null,
        OR: [
          { firstName: { contains: inputSearch, mode: "insensitive" } },
          { lastName: { contains: inputSearch, mode: "insensitive" } },
          {
            ProfessionalSpecializations: {
              some: {
                specialization: { contains: inputSearch, mode: "insensitive" },
              },
            },
          },
          {
            qualifications: {
              some: {
                OR: [
                  { city: { contains: inputSearch, mode: "insensitive" } },
                  { state: { name: { contains: inputSearch, mode: "insensitive" } } },
                ],
              },
            },
          },
        ],
      };

      const doctors = await db.professionalUser.findMany({
        where: whereCondition,
        // Exactly what the dropdown renders: a name to show and a username to link
        // to. Nothing else belongs in a typeahead response.
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          displayQualification: {
            select: { specialization: true },
          },
        },
        orderBy: { firstName: "asc" },
        // A typeahead shows a handful of rows; without a bound a one-character
        // query walks the whole table on every keystroke.
        take: 10,
      });

      return { doctors };
    }),
});
