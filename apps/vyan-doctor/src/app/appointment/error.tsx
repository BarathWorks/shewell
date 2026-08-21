"use client";

import { useEffect, useState } from "react";
import { reportClientError } from "~/lib/report-client-error";

/**
 * Segment boundary for appointment.
 *
 * Catches failures inside this section only, so the rest of the app — header,
 * navigation and every other route — keeps working instead of falling through to
 * the root boundary and blanking the page.
 */
export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    setReference(
      reportClientError({ error, boundary: "segment:appointment", digest: error.digest })
    );
  }, [error]);

  return (
    <div style={{ padding: "3rem 1.5rem", textAlign: "center", minHeight: "40vh" }}>
      <div style={{ maxWidth: "30rem", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          This section is unavailable
        </h2>
        <p style={{ color: "#555", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          Something went wrong loading this part of the site. The rest of the site is
          still working.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1.2rem",
            borderRadius: "0.5rem",
            border: "1px solid rgba(0,0,0,0.2)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {reference || error.digest ? (
          <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "#999" }}>
            Reference: {reference ?? error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
