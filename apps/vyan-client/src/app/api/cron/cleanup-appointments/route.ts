import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { subMinutes } from "date-fns";

import { authorizeCronRequest } from "~/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Fails closed when CRON_SECRET is unset — this endpoint mass-cancels every
  // pending appointment, so an unauthenticated caller must never reach it.
  const auth = authorizeCronRequest(request, "appointment cleanup");
  if (auth.status === "denied") return auth.response;

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
