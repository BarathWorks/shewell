"use client";

import Link from "next/link";
import { CheckCircle2, Link2, Video } from "lucide-react";

import { buttonClass } from "~/components/ui/button-styles";

/**
 * Google Meet connection status.
 *
 * Was two near-identical 40-line blocks in `doctor-profile-content.tsx`, each
 * repeating the full four-path Google mark inline and differing only in colour
 * and wording. More importantly, the disconnected state looked like a promotion —
 * a solid teal button reading "Add your Google account" — with nothing saying why
 * it mattered. Without it, online consultations have no meeting link, which is a
 * warning, not an upsell, and it is now phrased as one.
 */

function GoogleMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 262"
      className={className}
    >
      <path
        fill="#4285f4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      />
      <path
        fill="#34a853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      />
      <path
        fill="#fbbc05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
      />
      <path
        fill="#eb4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      />
    </svg>
  );
}

export default function GoogleConnection({
  isConnected,
}: {
  isConnected: boolean;
}) {
  if (isConnected) {
    return (
      <div className="surface-card flex flex-wrap items-center gap-3 border-secondary-200/70 bg-success-50 px-4 py-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface ring-1 ring-secondary-200/70"
        >
          <GoogleMark />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary-800">
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
            Google account connected
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-secondary-700">
            Online consultations get a Meet link automatically, added to both
            calendars.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card flex flex-wrap items-center gap-3 border-warning-100 bg-warning-50 px-4 py-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface ring-1 ring-warning-100"
      >
        <Video className="size-[18px] text-warning-600" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-warning-600">
          Connect Google to host online consultations
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-warning-600/90">
          Until you connect an account, online bookings have no meeting link and
          neither you nor your client gets a calendar invitation.
        </p>
      </div>

      <Link
        href="/api/google-meet-auth"
        className={buttonClass({
          variant: "outline",
          size: "sm",
          className: "shrink-0 bg-surface",
        })}
      >
        <Link2 aria-hidden="true" className="size-4" />
        Connect Google
      </Link>
    </div>
  );
}
