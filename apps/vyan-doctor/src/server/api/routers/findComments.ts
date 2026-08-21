import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * A patient's notes and history, for the practitioner treating them.
 *
 * The patient-history and meeting-detail queries here were scoped to the caller's
 * practitioner id. The comment query was not:
 *
 *     db.comment.findMany({ where: { bookAppointmentId } })
 *
 * — so any authenticated practitioner could pass any appointment id and read
 * another clinician's free-text clinical notes on a patient who was never theirs.
 * The two scoped queries returning nothing did not stop the comments coming back.
 *
 * The appointment is now resolved *first*, scoped to the caller. Nothing else runs
 * until that has established the caller may see this appointment at all, and the
 * comment query keys off the row it returned rather than off the raw input.
 *
 * Also moved from `publicProcedure` to `protectedProcedure`. The session was
 * checked by hand inside the resolver, which worked, but left the procedure's
 * declared contract saying the opposite — and `protectedProcedure` is what
 * guarantees `user.id` is present rather than `undefined`, which Prisma would drop
 * from a `where` clause instead of matching nothing.
 */
export const searchCommentsRouter = createTRPCRouter({
  searchComments: protectedProcedure
    .input(
      z.object({
        bookAppointmentId: z.string(),
        patientId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { bookAppointmentId, patientId } = input;
      const professionalUserId = ctx.session.user.id;

      // Gate: this appointment must belong to the caller. Everything below keys off
      // the result, not off the raw input.
      const appointment = await db.bookAppointment.findFirst({
        where: {
          id: bookAppointmentId,
          professionalUserId,
        },
        select: { id: true, patientId: true },
      });

      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // The patient id also arrives from the browser; it has to be the one actually
      // attached to this appointment, or history could be pulled for someone else.
      if (appointment.patientId !== patientId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [patientHistory, meetingDetails, comments] = await Promise.all([
        db.bookAppointment.findMany({
          where: {
            NOT: { id: appointment.id },
            patientId: appointment.patientId,
            professionalUserId,
          },
          select: {
            startingTime: true,
            endingTime: true,
            createdAt: true,
            status: true,
            professionalUser: {
              select: {
                displayQualification: { select: { specialization: true } },
              },
            },
            patient: {
              select: { firstName: true, additionalPatients: true },
            },
            comments: true,
          },
        }),

        db.bookAppointment.findFirst({
          where: { id: appointment.id, professionalUserId },
          select: {
            startingTime: true,
            endingTime: true,
            createdAt: true,
            comments: true,
            professionalUser: { select: { displayQualification: true } },
            patient: { select: { additionalPatients: true } },
          },
        }),

        // Keyed off the row we just proved the caller owns.
        db.comment.findMany({
          where: { bookAppointmentId: appointment.id },
        }),
      ]);

      // Previously logged the whole result set — comments, history and all — to
      // stdout on every call. These are clinical notes.
      return { comments, meetingDetails, patientHistory };
    }),
});
