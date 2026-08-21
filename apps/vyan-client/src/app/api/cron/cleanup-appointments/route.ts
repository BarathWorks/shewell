import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { subMinutes } from "date-fns";

export const dynamic = "force-dynamic";

/** Constant-time compare so the secret cannot be recovered by timing responses. */
function tokenMatches(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Fail closed. With CRON_SECRET unset the old check compared against the string
  // "Bearer undefined", which anyone could send — and this endpoint mass-cancels
  // every pending appointment.
  if (!secret) {
    console.error("CRON_SECRET is not set; refusing to run cleanup");
    return new Response("Not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!tokenMatches(`Bearer ${secret}`, authHeader)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Find appointments that are PAYMENT_PENDING and older than 5 minutes
    const fiveMinutesAgo = subMinutes(new Date(), 5);

    const pendingAppointments = await db.bookAppointment.findMany({
      where: {
        status: BookAppointmentStatus.PAYMENT_PENDING,
        createdAt: {
          lt: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
      },
    });

    if (pendingAppointments.length === 0) {
      return NextResponse.json({
        message: "No stale pending appointments found",
        count: 0,
      });
    }

    const appointmentIds = pendingAppointments.map((a) => a.id);

    // Mark them as CANCELLED.
    //
    // `status` is repeated in the filter deliberately. Between the read above and
    // this write, a payment can land — via the browser callback or the Razorpay
    // webhook — and flip the booking to PAYMENT_SUCCESSFUL. Filtering on id alone
    // would then cancel a booking that had just been paid for.
    const result = await db.bookAppointment.updateMany({
      where: {
        id: {
          in: appointmentIds,
        },
        status: BookAppointmentStatus.PAYMENT_PENDING,
      },
      data: {
        status: BookAppointmentStatus.CANCELLED,
      },
    });

    console.log(`Cron Cleanup: Cancelled ${result.count} stale pending appointments.`);

    return NextResponse.json({
      message: `Successfully cleaned up ${result.count} appointments`,
      count: result.count,
    });
  } catch (error) {
    console.error("Cron Cleanup Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during cleanup" },
      { status: 500 }
    );
  }
}
