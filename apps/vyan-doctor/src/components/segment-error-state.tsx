"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { reportClientError } from "~/lib/report-client-error";
import { Button } from "~/components/ui/button";

/**
 * What a route segment shows when it throws.
 *
 * The seven `error.tsx` files under `src/app/*` were byte-identical apart from
 * the `boundary` string, and each carried the same six inline `style={{}}`
 * objects — `#555` body text, a `rgba(0,0,0,0.2)` border, a white button. So the
 * screens a practitioner only sees when something has already gone wrong were
 * also the seven screens that looked least like the product. One component now;
 * each boundary passes its own name.
 */
export default function SegmentErrorState({
  error,
  reset,
  boundary,
  title = "This section is unavailable",
  description = "Something went wrong loading this part of the app. The rest of it is still working.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  boundary: string;
  title?: string;
  description?: string;
}) {
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    setReference(reportClientError({ error, boundary, digest: error.digest }));
  }, [error, boundary]);

  return (
    <div className="container-page py-10 md:py-14">
      <div className="surface-card mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-warning-50 text-warning-600 ring-1 ring-warning-100"
        >
          <AlertTriangle className="size-5" />
        </span>

        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {description}
          </p>
        </div>

        <Button variant="outline" onClick={() => reset()} leadingIcon={RotateCw}>
          Try again
        </Button>

        {reference || error.digest ? (
          <p className="text-xs text-muted">
            Reference:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-2xs text-body">
              {reference ?? error.digest}
            </code>
          </p>
        ) : null}
      </div>
    </div>
  );
}
