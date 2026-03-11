import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
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
export const searchOngoingAppointmentsRouter = createTRPCRouter({
  searchOngoingAppointments: publicProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { date } = input;

      const user = { id: ctx.session?.user?.id };

      const startDate = startOfDay(date);
      const endDate = endOfDay(date);
      const currentTime = new Date();

      const onGoingAppointments = await db.bookAppointment.findMany({
        select: {
          id: true,
          startingTime: true,
          endingTime: true,
          totalPriceInCents: true,
          professionalUser: {
            select: {
              firstName: true,
              id: true,
              displayQualification: {
                select: {
                  specialization: true,
                },
              },
            },
          },
          meeting: true,
          patient: {
            select: {
              firstName: true,
              message: true,
              additionalPatients: true,
            },
          },
          status: true,
          serviceType: true,
          razorpayPaymentId: true,
        },
        where: {
          userId: user?.id,
          startingTime: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            notIn: [
              BookAppointmentStatus.CANCELLED &&
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
            ],
          },
        },
      });

      // // filtering the appointments before starting time
      // const onGoingAppointmentsbeforeStartingTime = onGoingAppointments.filter(
      //   (appointment) =>
      //     isAfter(new Date(appointment.startingTime), currentTime),
      // );

      // Map through each appointment and typecast the meeting field
      const typedAppointments = onGoingAppointments.map((appointment) => {
        // Typecast only the meeting field
        return {
          ...appointment,
          meeting: appointment.meeting as IGoogleCalenderEvent, // Typecasting the meeting field
        };
      });
      console.log("onGoingAppointmentsbeforeStartingTime", onGoingAppointments);
      return { typedAppointments };
    }),
});
