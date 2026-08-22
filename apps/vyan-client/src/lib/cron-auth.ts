import "server-only";

import crypto from "crypto";

/**
 * Shared bearer-token check for the scheduled endpoints.
 *
 * These routes are publicly reachable URLs — one mass-cancels bookings, the other
 * mails every upcoming patient — so they are gated on `CRON_SECRET`, which Vercel
 * Cron sends as `Authorization: Bearer <CRON_SECRET>`.
 *
 * The check fails closed. With `CRON_SECRET` unset, comparing against the string
 * `"Bearer undefined"` would let anyone who sends that header run the job.
 */

/** Constant-time compare, so the secret cannot be recovered by timing responses. */
function tokenMatches(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Discriminated on a string rather than a `success: boolean`.
 *
 * This app compiles with `strict: false`, and with `strictNullChecks` off
 * TypeScript will not narrow a union on a boolean-literal discriminant — every
 * `if (!result.success)` branch still saw the success shape, so `result.code` was
 * a type error. A string discriminant narrows in both modes.
 */
export type CronAuthResult = { status: "ok" } | { status: "denied"; response: Response };

export function authorizeCronRequest(request: Request, jobName: string): CronAuthResult {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error(`CRON_SECRET is not set; refusing to run ${jobName}`);
    return { status: "denied", response: new Response("Not configured", { status: 500 }) };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!tokenMatches(`Bearer ${secret}`, authHeader)) {
    return { status: "denied", response: new Response("Unauthorized", { status: 401 }) };
  }

  return { status: "ok" };
}
