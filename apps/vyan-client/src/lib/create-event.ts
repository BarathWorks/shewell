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

"use server";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarClient } from "../lib/google-calendar";
import { getSession } from "next-auth/react";
import { db } from "~/server/db";
import { getServerSession } from "next-auth";
import { formatISO } from "date-fns";

import axios from "axios";
import { env } from "~/env";

const tokenUrl = "https://oauth2.googleapis.com/token";
const calendarUrl =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// ❌ DO NOT put async code at module level - it will fail on import!
// Session and DB queries must be inside functions

export async function getAccessToken(professionalUserId: string) {
  try {
    console.log(
      "🔑 getAccessToken: Starting token retrieval for doctor:",
      professionalUserId,
    );

    // Get refresh token from database using the DOCTOR's ID (not session user!)
    const refreshTokenRecord = await db.professionalUser.findFirst({
      select: {
        googleRefreshToken: true,
        email: true,
      },
      where: {
        id: professionalUserId,
      },
    });

    if (!refreshTokenRecord?.googleRefreshToken) {
      console.error(
        "❌ getAccessToken: Refresh token not found for doctor:",
        professionalUserId,
      );
      throw new Error(
        "Doctor's Google refresh token not found. Doctor needs to reconnect Google account.",
      );
    }

    console.log(
      "✅ getAccessToken: Refresh token found for",
      refreshTokenRecord.email,
    );

    // Google OAuth2 requires credentials in the POST body, NOT as URL params
    const tokenData = new URLSearchParams({
      grant_type: "refresh_token",
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshTokenRecord.googleRefreshToken,
      client_id: env.GOOGLE_CLIENT_ID,
    });

    const response = await axios.post(tokenUrl, tokenData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("✅ getAccessToken: Access token refreshed successfully");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ getAccessToken ERROR:", error);
    throw error;
  }
}

export async function createEvent({
  professionalUserId,
  appointmentId,
  startTime,
  endTime,
  patientName,
  patientEmail,
  planName,
  description,
}: {
  professionalUserId: string;
  appointmentId: string;
  startTime: Date;
  endTime: Date;
  patientName: string;
  patientEmail: string;
  planName: string;
  description: string;
}) {
  console.log("📅 createEvent: FUNCTION CALLED", {
    professionalUserId,
    appointmentId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });

  try {
    console.log("📅 createEvent: Getting access token...");
    const access_token = await getAccessToken(professionalUserId);
    console.log("✅ createEvent: Access token retrieved");

    const calendarUrl =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events";

    const event = {
      summary: `Consultation: ${patientName}`,
      description: `${planName}\n\n${description}\n\nPatient: ${patientName}\nEmail: ${patientEmail}`,
      start: {
        dateTime: formatISO(startTime),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: formatISO(endTime),
        timeZone: "Asia/Kolkata",
      },
      attendees: [
        { email: patientEmail, displayName: patientName },
      ],
      conferenceData: {
        createRequest: {
          requestId: `appointment-${appointmentId}-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    console.log("📅 createEvent: Sending request to Google Calendar API", {
      summary: event.summary,
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      timezone: event.start.timeZone,
    });

    const response = await axios.post(calendarUrl, event, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      params: {
        conferenceDataVersion: 1,
        sendUpdates: "all",
      },
    });

    console.log("✅ createEvent: Event created successfully!", {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
      htmlLink: response.data.htmlLink,
    });

    // Store the meeting link in the appointment
    await db.bookAppointment.update({
      where: { id: appointmentId },
      data: {
        meeting: {
          meetLink: response.data.hangoutLink,
          eventId: response.data.id,
        },
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ createEvent: Google Calendar API error", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("❌ createEvent: Unexpected error", error);
    }
    throw new Error(
      `Event cannot be generated: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
export async function updateEvent({
  professionalUserId,
  eventId,
  newStartTime,
  newEndTime,
  patientName,
  patientEmail,
  planName,
  description,
}: {
  professionalUserId: string;
  eventId: string;
  newStartTime: Date;
  newEndTime: Date;
  patientName: string;
  patientEmail: string;
  planName: string;
  description: string;
}) {
  console.log("📅 updateEvent: FUNCTION CALLED", {
    professionalUserId,
    eventId,
    newStartTime: newStartTime.toISOString(),
    newEndTime: newEndTime.toISOString(),
  });

  try {
    console.log("📅 updateEvent: Getting access token...");
    const access_token = await getAccessToken(professionalUserId);
    console.log("✅ updateEvent: Access token retrieved");

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

    const updatedEvent = {
      summary: `Consultation: ${patientName}`,
      description: `${planName}\n\n${description}\n\nPatient: ${patientName}\nEmail: ${patientEmail}`,
      start: {
        dateTime: formatISO(newStartTime),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: formatISO(newEndTime),
        timeZone: "Asia/Kolkata",
      },
      attendees: [
        {
          email: patientEmail,
          displayName: patientName,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    console.log("📅 updateEvent: Sending PATCH request to Google Calendar", {
      eventId,
      summary: updatedEvent.summary,
      newStartTime: updatedEvent.start.dateTime,
      newEndTime: updatedEvent.end.dateTime,
      timezone: updatedEvent.start.timeZone,
    });

    const response = await axios.patch(calendarUrl, updatedEvent, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      params: {
        sendUpdates: "all",
      },
    });

    console.log("✅ updateEvent: Event updated successfully!", {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
      htmlLink: response.data.htmlLink,
      updatedTime: response.data.updated,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ updateEvent: Google Calendar API error", {
        eventId,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("❌ updateEvent: Unexpected error", error);
    }
    throw new Error(
      `Event update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteEvent(
      console.error("❌ updateEvent: Google Calendar API error", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("❌ updateEvent: Unexpected error", error);
    }
    throw new Error(
      `Event cannot be updated: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function deleteEvent({
  professionalUserId,
  eventId,
}: {
  professionalUserId: string;
  eventId: string;
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
  if (!access_token) {
    throw new Error("Access token not found");
  }

  console.log(
    "access_token",
    access_token,
    professionalUserId,
    "eventId",
    eventId,
  );

  const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
  try {
    // Make a DELETE request to Google Calendar API to delete the event
    const response = await axios.delete(calendarUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Event deleted successfully", response.data);

    return {
      message: "Event deleted successfully",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("delete-event-error-1", error.status);
      console.error(
        "delete-event-error-2",
        JSON.stringify(error.response?.data.error),
      );
    } else {
      console.error("general-error", error);
    }
    console.log("delete-event-error", error);
    throw new Error("Event could not be deleted");
  }
}
