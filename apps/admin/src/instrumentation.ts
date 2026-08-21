import { initObservability } from "@repo/observability";

/**
 * Runs once per server instance, before any request is handled.
 *
 * Sets the app name that every log line is tagged with, so the three apps stay
 * distinguishable in Vercel's Runtime Logs. This is also the place to attach an
 * external error tracker: install `@sentry/nextjs`, then pass a `reporter` that
 * forwards to `Sentry.captureException`. Everything else already routes through
 * `captureException`, so nothing else has to change.
 */
export function register() {
  initObservability({
    app: "admin",
    level: process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error" | undefined,
  });
}
