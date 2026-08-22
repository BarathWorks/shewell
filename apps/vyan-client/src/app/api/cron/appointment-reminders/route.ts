import { NextResponse } from "next/server";
import { addHours, differenceInMinutes, format, subMinutes } from "date-fns";
import { BookAppointmentStatus } from "@repo/database";
import { sendEmail } from "@repo/mail";
import { logger } from "@repo/observability";

import { db } from "~/server/db";
import { authorizeCronRequest } from "~/lib/cron-auth";
import {
  getAppointmentReminderEmailTemplate,
  getDoctorAppointmentReminderEmailTemplate,
} from "~/lib/email-templates";

/**
 * Appointment reminder emails.
 *
 * Scheduled every 15 minutes (see `vercel.json`). Two reminders go out per booking:
 * one the day before and one shortly before it starts. Both the patient and the
 * practitioner are mailed.
 *
 * The selection is a *catch-up* window rather than a narrow band around "exactly 24
 * hours from now": anything starting within the next 24 hours that has not been
 * reminded yet is picked up. A band tuned to the cron interval silently drops every
 * booking whose run was delayed or skipped, and scheduled jobs are skipped more
 * often than they are supposed to be.
 *
 * Because the window is wider than the interval, the same booking is selected by
 * consecutive runs. Two columns make that safe: a run *claims* a booking with a
 * conditional `updateMany` before sending anything, so only one run — and only one
 * concurrent invocation — can win it.
 */

export const dynamic = "force-dynamic";
// Mail is slow; a large backlog must not be cut off mid-batch by the default limit.
export const maxDuration = 60;

/** Bookings handled per run per window. Keeps one invocation inside its budget. */
const BATCH_LIMIT = 50;

/**
 * A booking created moments ago does not need "your appointment is tomorrow" on the
 * heels of its confirmation email.
 */
const CONFIRMATION_QUIET_MINUTES = 30;

type ReminderWindow = "24h" | "1h";

const appointmentInclude = {
  professionalUser: {
    select: { firstName: true, lastName: true, email: true },
  },
  patient: {
    select: { firstName: true, lastName: true, email: true },
  },
} as const;

type ReminderAppointment = {
  id: string;
  startingTime: Date;
  endingTime: Date;
  planName: string;
  serviceType: string;
  meeting: unknown;
  professionalUser: { firstName: string | null; lastName: string | null; email: string | null };
  patient: { firstName: string; lastName: string | null; email: string };
};

/**
 * How far off the appointment is, in words.
 *
 * Derived from the real gap rather than from which reminder this is: the day-before
 * job picks up everything inside the next 24 hours, and a booking made two hours in
 * advance is caught by it too. Relative phrasing throughout — "later today" would
 * need the patient's timezone, and this runs in UTC.
 */
function leadPhrase(startingTime: Date, now: Date, window: ReminderWindow): string {
  if (window === "1h") return "in about an hour";

  const hours = differenceInMinutes(startingTime, now) / 60;
  if (hours >= 20) return "tomorrow";
  // The 24h window's lower bound is one hour out, so this never rounds below 2.
  return `in about ${Math.max(2, Math.round(hours))} hours`;
}

/** The Google Meet link stored by `createEvent`, when there is one. */
function meetingLinkOf(meeting: unknown): string | undefined {
  if (!meeting || typeof meeting !== "object") return undefined;
  const link = (meeting as { meetLink?: unknown }).meetLink;
  return typeof link === "string" && link ? link : undefined;
}

/**
 * Which column records this window, as a Prisma filter / update fragment.
 *
 * Written out per branch rather than as a computed key (`{ [column]: value }`),
 * which erases the field name to a string index signature and takes the model's
 * field types out of the type checker's hands.
 */
function reminderSent(window: ReminderWindow, value: Date | null) {
  return window === "24h" ? { reminder24hSentAt: value } : { reminder1hSentAt: value };
}

async function findDue(window: ReminderWindow, now: Date): Promise<ReminderAppointment[]> {
  const startingTime =
    window === "24h"
      ? {
          // Not "in exactly 24 hours" — everything inside the next day that has not
          // been reminded. The lower bound keeps a booking that is 40 minutes away
          // from being told it is "tomorrow"; the 1h window covers those.
          gt: addHours(now, 1),
          lte: addHours(now, 24),
        }
      : { gt: now, lte: addHours(now, 1) };

  return db.bookAppointment.findMany({
    where: {
      status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
      ...reminderSent(window, null),
      startingTime,
      ...(window === "24h"
        ? { createdAt: { lt: subMinutes(now, CONFIRMATION_QUIET_MINUTES) } }
        : {}),
    },
    select: {
      id: true,
      startingTime: true,
      endingTime: true,
      planName: true,
      serviceType: true,
      meeting: true,
      ...appointmentInclude,
    },
    orderBy: { startingTime: "asc" },
    take: BATCH_LIMIT,
  });
}

/**
 * Marks the booking as reminded, and reports whether this call is the one that got
 * to do it. Conditional on the column still being null, so a concurrent run — or
 * the next scheduled one, if this is running long — cannot send a second copy.
 */
async function claim(appointmentId: string, window: ReminderWindow, at: Date) {
  const result = await db.bookAppointment.updateMany({
    where: { id: appointmentId, ...reminderSent(window, null) },
    data: reminderSent(window, at),
  });

  return result.count > 0;
}

/**
 * Hands the booking back for a later run.
 *
 * Called when the send failed. The natural window bounds the retries — a booking
 * stops being selected once it starts — so this cannot loop indefinitely on an
 * address that will never accept mail.
 */
async function releaseClaim(appointmentId: string, window: ReminderWindow) {
  try {
    await db.bookAppointment.update({
      where: { id: appointmentId },
      data: reminderSent(window, null),
    });
  } catch (error) {
    logger.error("reminder.release_failed", {
      source: "cron",
      route: "appointment-reminders",
      appointmentId,
      error,
    });
  }
}

async function sendReminder(
  appointment: ReminderAppointment,
  window: ReminderWindow,
  now: Date,
) {
  const doctorName =
    `${appointment.professionalUser.firstName ?? ""} ${appointment.professionalUser.lastName ?? ""}`.trim() ||
    "your expert";
  const patientName =
    `${appointment.patient.firstName} ${appointment.patient.lastName ?? ""}`.trim();
  const appointmentTime = `${format(appointment.startingTime, "hh:mm a")} - ${format(
    appointment.endingTime,
    "hh:mm a",
  )}`;
  const meetingLink = meetingLinkOf(appointment.meeting);
  const lead = leadPhrase(appointment.startingTime, now, window);
  const isImminent = window === "1h";

  const patientTemplate = getAppointmentReminderEmailTemplate({
    userName: appointment.patient.firstName,
    userEmail: appointment.patient.email,
    doctorName,
    appointmentDate: appointment.startingTime,
    appointmentTime,
    planName: appointment.planName,
    serviceType: appointment.serviceType,
    meetingLink,
    lead,
    isImminent,
  });

  // The patient reminder is the point of the job: if it fails the booking is
  // released and retried, so this one is allowed to throw.
  await sendEmail({
    to: [appointment.patient.email],
    subject: patientTemplate.subject,
    html: patientTemplate.html,
  });

  if (!appointment.professionalUser.email) return;

  // The practitioner copy is secondary. Failing it must not cause the patient to be
  // reminded twice on the retry.
  try {
    const doctorTemplate = getDoctorAppointmentReminderEmailTemplate({
      doctorName,
      patientName,
      appointmentDate: appointment.startingTime,
      appointmentTime,
      planName: appointment.planName,
      serviceType: appointment.serviceType,
      meetingLink,
      lead,
      isImminent,
    });

    await sendEmail({
      to: [appointment.professionalUser.email],
      subject: doctorTemplate.subject,
      html: doctorTemplate.html,
    });
  } catch (error) {
    logger.error("reminder.doctor_email_failed", {
      source: "cron",
      route: "appointment-reminders",
      appointmentId: appointment.id,
      error,
    });
  }
}

async function runWindow(window: ReminderWindow, now: Date) {
  const due = await findDue(window, now);
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  // Sequential on purpose: SMTP providers rate-limit concurrent sends, and Gmail in
  // particular closes the connection under a burst. A batch of 50 is well inside a
  // 60-second budget at ~0.5s each.
  for (const appointment of due) {
    const won = await claim(appointment.id, window, now);
    if (!won) {
      skipped++;
      continue;
    }

    try {
      await sendReminder(appointment, window, now);
      sent++;
    } catch (error) {
      failed++;
      logger.error("reminder.patient_email_failed", {
        source: "cron",
        route: "appointment-reminders",
        appointmentId: appointment.id,
        window,
        error,
      });
      await releaseClaim(appointment.id, window);
    }
  }

  // A full batch means there is more waiting. Said out loud, because a silent cap
  // reads as "everyone was reminded" when they were not.
  const truncated = due.length === BATCH_LIMIT;
  if (truncated) {
    logger.warn("reminder.batch_truncated", {
      source: "cron",
      route: "appointment-reminders",
      window,
      limit: BATCH_LIMIT,
    });
  }

  return { window, considered: due.length, sent, failed, skipped, truncated };
}

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request, "appointment reminders");
  if (auth.status === "denied") return auth.response;

  const now = new Date();

  try {
    // The 1-hour window runs first: it is the time-critical one, so if the budget
    // runs out it should not be the batch that was left waiting.
    const soon = await runWindow("1h", now);
    const tomorrow = await runWindow("24h", now);

    logger.info("reminder.run_complete", {
      source: "cron",
      route: "appointment-reminders",
      soon,
      tomorrow,
    });

    return NextResponse.json({
      message: `Sent ${soon.sent + tomorrow.sent} reminder(s)`,
      windows: [soon, tomorrow],
    });
  } catch (error) {
    logger.error("reminder.run_failed", {
      source: "cron",
      route: "appointment-reminders",
      error,
    });
    return NextResponse.json(
      { error: "Internal Server Error while sending reminders" },
      { status: 500 },
    );
  }
}
