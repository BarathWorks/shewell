import { NextResponse, type NextRequest } from "next/server";
import { captureException, logger } from "@repo/observability";

/**
 * Receives error reports from the browser.
 *
 * React rendering errors, unhandled promise rejections and boundary catches all
 * happen client-side and never reach the server logs on their own. This endpoint
 * is how they get there, tagged with the same `reference` the user sees.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  try {
    // Only accept reports from our own pages; this endpoint is unauthenticated
    // because errors must still be reportable when the session is what broke.
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && !origin.endsWith(host)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      logger.warn("client_report.too_large", { bytes: raw.length });
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    const body = JSON.parse(raw) as {
      message?: string;
      name?: string;
      stack?: string;
      digest?: string;
      reference?: string;
      componentStack?: string;
      route?: string;
      boundary?: string;
    };

    // A plain Error, not an AppError: `classifyError` trusts an AppError's own
    // kind and would short-circuit to UNKNOWN instead of inspecting the message.
    const error = new Error(body.message || "Client error");
    if (body.name) error.name = body.name;
    if (body.stack) error.stack = body.stack;

    const result = captureException(error, {
      source: "client",
      route: body.route,
      boundary: body.boundary,
      digest: body.digest,
      reference: body.reference,
      componentStack: body.componentStack,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true, reference: result.reference });
  } catch (error) {
    logger.warn("client_report.failed", { error });
    // Never surface a failure here: the caller is already handling an error.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
