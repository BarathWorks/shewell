import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  format,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfDay,
} from "date-fns";
import { BookAppointmentStatus } from "@repo/database";
type IGoogleCalenderEvent = {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  creator: {
    email: string;
    self: boolean;
  };
  organizer: {
    email: string;
    self: boolean;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  iCalUID: string;
  sequence: number;
  hangoutLink: string;
  conferenceData: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: unknown;
      status: unknown;
    };
    entryPoints: unknown[];
    conferenceSolution: {
      key: unknown[];
      name: string;
      iconUri: string;
    };
    conferenceId: string;
  };
  reminders: {
    useDefault: boolean;
  };
  eventType: string;
  attachments: [
    {
      fileUrl: string;
      title: string;
      mimeType: string;
      iconLink: string;
      fileId: string;
    },
  ];
};
export const searchUpcomingAppointmentsRouter = createTRPCRouter({
  searchUpcomingAppointments: publicProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date } = input;

      const user = { id: ctx.session?.user?.id };

      const startDate = startOfDay(addDays(new Date(date), 1));
      const endDate = addDays(startDate, 7);

      const upcomingAppointments = await db.bookAppointment.findMany({
        select: {
          id: true,
          startingTime: true,
          endingTime: true,
          totalPriceInCents: true,
          professionalUser: {
            select: {
              id: true,
              firstName: true,
              displayQualification: {
                select: {
                  specialization: true,
                },
              },
            },
          },
          serviceType: true,
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              message: true,
              additionalPatients: true,
            },
          },

          meeting: true,
        },
        where: {
          userId: user?.id,
          startingTime: {
            gte: startDate,
            // lte: endDate,
          },
          status: {
            in: [BookAppointmentStatus.PAYMENT_SUCCESSFUL],
            notIn: [
              BookAppointmentStatus.CANCELLED &&
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
            ],
          },
        },
      });

      // Map through each appointment and typecast the meeting field
      const typedUpcomingAppointments = upcomingAppointments.map(
        (appointment) => {
          // Typecast only the meeting field
          return {
            ...appointment,
            meeting: appointment.meeting as IGoogleCalenderEvent, // Typecasting the meeting field
          };
        },
      );
      console.log(
        "upcomingAppointments",
        upcomingAppointments,
        startDate,
        endDate,
      );
      return { typedUpcomingAppointments };
    }),
});
