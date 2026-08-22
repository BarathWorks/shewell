"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RotateCw } from "lucide-react";

import { reportClientError } from "~/lib/report-client-error";
import { Button } from "~/components/ui/button";
import { buttonClass } from "~/components/ui/button-styles";

/**
 * Route-level error boundary.
 *
 * Without this, a throw during a server render (most often a Prisma failure) falls
 * through to Next.js's built-in page, which shows an opaque digest and logs
 * nothing usable. Here the failure is reported and the user is given a reference
 * that matches a single line in the server logs.
 *
 * Restyled onto the design system — it was inline `style={{}}` objects with a
 * `#111` button, so the one screen a practitioner sees when something breaks was
 * also the one screen that did not look like the product.
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
      reportClientError({ error, boundary: "route:root", digest: error.digest }),
    );
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-50 text-danger-600 ring-1 ring-danger-100"
        >
          <AlertTriangle className="size-6" />
        </span>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          We hit a problem loading this page. Trying again often clears it — your
          data has not been affected.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={() => reset()} leadingIcon={RotateCw}>
            Try again
          </Button>

          <Link
            href="/dashboard"
            className={buttonClass({ variant: "outline", size: "md" })}
          >
            <LayoutDashboard aria-hidden="true" className="size-4" />
            Go to dashboard
          </Link>
        </div>

        {reference || error.digest ? (
          <p className="mt-6 text-xs text-muted">
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
