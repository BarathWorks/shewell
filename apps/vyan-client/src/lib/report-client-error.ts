"use client";

import { newReference } from "@repo/observability";

export type ClientErrorReport = {
  error: unknown;
  boundary: string;
  componentStack?: string;
  digest?: string;
};

/**
 * Sends a browser-side error to the server so it lands in the same logs as
 * everything else, and returns the reference to show the user.
 *
 * Uses `keepalive` so the report still goes out if the error happened during a
 * navigation that is about to tear the page down.
 */
export function reportClientError({
  error,
  boundary,
  componentStack,
  digest,
}: ClientErrorReport): string {
  const reference = newReference();

  try {
    const err = error as { message?: string; stack?: string; digest?: string };
    const payload = JSON.stringify({
      message: err?.message ?? String(error),
      stack: err?.stack,
      digest: digest ?? err?.digest,
      reference,
      componentStack,
      boundary,
      route: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    void fetch("/api/observability/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Reporting is best-effort; a failure here must stay invisible.
    });
  } catch {
    // Never let the reporter throw inside an error handler.
  }

  return reference;
}
