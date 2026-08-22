import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { BookAppointmentStatus } from "@repo/database";
import { getServerAuthSession } from "~/server/auth";
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
export const searchMeetingRouter = createTRPCRouter({
  searchMeeting: publicProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const { date } = input;
      const session = await getServerAuthSession();
      console.log("session", session);
      if(!session){
        throw new Error("Unauthorised")
      }
      if(!session.user.email){
        throw new Error("Unauthorised")
      }
      // converting the input date to start and end of the day
      // (using this we will get the meetings of a particular day regardless of the time)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const meetings = await db.bookAppointment.findMany({
        select: {
          id: true,
          patient: {
            select: {
              id: true,
              firstName: true,
            },
          },
          professionalUser: {
            select: {
              displayQualification: {
                select: {
                  specialization: true,
                },
              },
            },
          },
          meeting: true,
          startingTime: true,
          endingTime: true,
          status: true,
          // Selected so the day schedule can say whether a consultation is
          // online or in person. Without it every row looked identical, and
          // "am I expecting this person in the room?" is the one thing a
          // practitioner needs from that list before the appointment starts.
          serviceType: true,
        },
        where: {
          professionalUser: {
            email: session.user.email,
          },
          startingTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: [
              BookAppointmentStatus.PAYMENT_SUCCESSFUL,
              BookAppointmentStatus.COMPLETED,
            ],
          },
        },
      });

        // Map through each appointment and typecast the meeting field
        const typedMeetings = meetings.map((meeting) => {
          // Typecast only the meeting field
          return {
              ...meeting,
              meeting: meeting.meeting as IGoogleCalenderEvent, // Typecasting the meeting field
          } ;
      });
      console.log("meetings", meetings);
      return { typedMeetings };
    }),
});
