import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { BookAppointmentStatus } from "@repo/database";
import { subMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    // Mark them as CANCELLED
    const result = await db.bookAppointment.updateMany({
      where: {
        id: {
          in: appointmentIds,
        },
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
