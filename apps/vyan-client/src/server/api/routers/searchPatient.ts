import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
export const searchPatientRouter = createTRPCRouter({
  searchPatient: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const user = { id: ctx.session?.user?.id };
      if (!user.id) {
        return;
      }
      const patient = await db.patient.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
        },
        select: {
          id: true,
          firstName: true,
          phoneNumber: true,
          email: true,
          message: true,
          lastName: true,
          additionalPatients: true,
        },
      });
      console.log("patient", patient);
      return { patient };
    }),
});
