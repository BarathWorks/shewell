import { NextResponse } from "next/server";
import { db } from "@/src/server/db";
import { logger, classifyError } from "@repo/observability";

/**
 * Liveness and database readiness.
 *
 * Point an uptime monitor here. It reports *why* the database is unreachable, not
 * just that something is wrong, so an alert distinguishes a suspended project from
 * an exhausted connection pool.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    // Cheapest possible round trip: proves the pool can hand out a connection.
    await db.$queryRaw`SELECT 1`;
    const ms = Date.now() - startedAt;

    if (ms > 1000) {
      logger.warn("health.db_slow", { source: "health", ms });
    }

    return NextResponse.json({ status: "ok", database: "up", latencyMs: ms });
  } catch (error) {
    const kind = classifyError(error);
    logger.error("health.db_down", { source: "health", kind, error });

    return NextResponse.json(
      { status: "degraded", database: "down", kind },
      { status: 503 }
    );
  }
}
