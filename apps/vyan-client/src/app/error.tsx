"use client";

import { useEffect, useState } from "react";
import { reportClientError } from "~/lib/report-client-error";

/**
 * Route-level error boundary.
 *
 * Without this, a throw during a server render (most often a Prisma failure) falls
 * through to Next.js's built-in page, which shows an opaque digest and logs
 * nothing usable. Here the failure is reported and the user is given a reference
 * that matches a single line in the server logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    setReference(
      reportClientError({ error, boundary: "route:root", digest: error.digest })
    );
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "32rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Something went wrong
        </h2>
        <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          We hit a problem loading this page. Please try again in a moment.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.6rem 1.4rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          Try again
        </button>
        {reference || error.digest ? (
          <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#999" }}>
            Reference: {reference ?? error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
