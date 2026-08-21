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


// NOTE: this module is imported by server code but is not a server-action
// module. It carried a "use server" directive here — valid, since only comments
// precede it — which turned `CreateEvent` into a callable public endpoint.
import { NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarClient } from "../lib/google-calendar";
import { getSession } from "next-auth/react";
import { db } from "~/server/db";
import { getServerSession } from "next-auth";

export async function CreateEvent({
  professionalUserId,
  appointmentId
}: {
  professionalUserId: string;
  appointmentId : string
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

  const calendar = getGoogleCalendarClient(access_token!);

  const event = {
    summary: "Google Meet Meeting",
    description: "A sample meeting with a Google Meet link",
    start: {
      dateTime: "2024-10-07T10:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2024-10-07T11:00:00-07:00",
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
    const response = await calendar.events.insert({
      calendarId: "primary",
      //   resource: event,
      conferenceDataVersion: 1, // Necessary to create Google Meet links
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating event", error },
      { status: 500 },
    );
  }
}
