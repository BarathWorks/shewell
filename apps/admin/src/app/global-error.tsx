"use client";

import { useEffect, useState } from "react";
import { reportClientError } from "@/src/lib/report-client-error";

/**
 * Catches errors thrown by the root layout itself, which a route-level `error.tsx`
 * cannot reach. Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    setReference(
      reportClientError({ error, boundary: "global", digest: error.digest })
    );
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            We are temporarily unavailable
          </h2>
          <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Our team has been notified. Please try again shortly.
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
      </body>
    </html>
  );
}
