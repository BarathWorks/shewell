// import { NextApiRequest, NextApiResponse } from "next";
// import { getGoogleCalendarClient } from "../lib/google-calendar";
// import { getSession } from "next-auth/react";
// import { db } from "~/server/db";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   const session = await getSession({ req });
//   if (!session) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }

//   const professionalUser = await db.professionalUser.findFirst({
//     where: {
//       email: session.user.email,
//     },
//   });
//   const access_token = await db.professionalUser.findFirst({
//     select: {
//       googleAccessToken: true,
//     },
//     where: {
//       id: professionalUser?.id,
//     },
//   });

//   const calendar = getGoogleCalendarClient(access_token?.googleAccessToken!);

//   const event = {
//     summary: "Google Meet Meeting",
//     description: "A sample meeting with a Google Meet link",
//     start: {
//       dateTime: "2024-10-07T10:00:00-07:00",
//       timeZone: "America/Los_Angeles",
//     },
//     end: {
//       dateTime: "2024-10-07T11:00:00-07:00",
//       timeZone: "America/Los_Angeles",
//     },
//     conferenceData: {
//       createRequest: {
//         requestId: "randomString",
//         conferenceSolutionKey: { type: "hangoutsMeet" },
//       },
//     },
//   };

//   try {
//     const response = await calendar.events.insert({
//       calendarId: "primary",
//       conferenceDataVersion: 1,

//       //   calendarId: "primary",
//       //   resource: event,
//       //   conferenceDataVersion: 1, // Necessary to create Google Meet links
//     });
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating event", error });
//   }
// }

// NOTE: this module is imported by server actions but is not one itself.
// It previously carried a "use server" directive here (valid, since only
// comments preceded it), which turned every export into a callable endpoint —
// including `getAccessToken`, which returns a practitioner's Google OAuth
// access token for whatever id it is handed.
import { NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarClient } from "../lib/google-calendar";
import { getSession } from "next-auth/react";
import { db } from "~/server/db";
import { getServerSession } from "next-auth";
import { formatISO } from "date-fns";

import axios from "axios";
export async function updateEvent({
  professionalUserId,
  startTime,
  endTime,
  meetingId
}: {
  professionalUserId: string;
  appointmentId: string;
  startTime: Date;
  endTime: Date;
  meetingId : string
}) {
  const accessTokenRecord = await db.professionalUser.findFirst({
    select: {
      googleAccessToken: true,
    },
    where: {
      id: professionalUserId,
    },
  });

  const access_token = accessTokenRecord?.googleAccessToken;
  console.log("access_token", access_token, professionalUserId);
  const calendarUrl =
    "https://www.googleapis.com/calendar/v3/calendars/primary/events";
  const calendar = getGoogleCalendarClient(access_token!);

  const event = {
    summary: "Google Meet Meeting",
    description: "A sample meeting with a Google Meet link",
    start: {
      dateTime: formatISO(startTime),
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: formatISO(endTime),
      timeZone: "America/Los_Angeles",
    },
    conferenceData: {
      createRequest: {
        requestId: "randomString",
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  try {
    // const response =  await calendar.events.insert({
    //   calendarId: "primary",

    //     resource: event,
    //   conferenceDataVersion: 1, // Necessary to create Google Meet links
    // });

    // console.log("create-google-event")
    // return {
    //   message : "Event has been generated"
    // }

    const response = await axios.patch(`${calendarUrl}/${meetingId}`, event, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
        },
        params: {
            conferenceDataVersion: 1,
        },
    });

    console.log(" responseData", response.data);

    return response.data;
  } catch (error) {
    console.log("create-event-error", error);
    throw new Error("Event cannot be generated");
  }
}
