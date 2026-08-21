import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
export const searchPatientForEditRouter = createTRPCRouter({
  searchPatientForEdit: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { patientId } = input;

      const user = { id: ctx.session.user.id };
      const patient = await db.patient.findFirst({
        where: {
          userId: user.id,
          id: patientId,
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
