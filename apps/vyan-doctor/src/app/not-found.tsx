import Link from "next/link";
import { CalendarDays, Compass, LayoutDashboard } from "lucide-react";

import { buttonClass } from "~/components/ui/button-styles";

/**
 * 404.
 *
 * Was styled entirely with inline `style={{}}` objects — `color: "#555"`, an
 * underlined `#111` link — so it inherited nothing from the design system and
 * looked like a different product. It also offered a single "Go back home" link
 * to `/`, which in this app redirects to `/dashboard`; a practitioner who
 * mistyped a URL got one destination and no idea what else existed.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-200/70"
        >
          <Compass className="size-6" />
        </span>

        <p className="eyebrow mt-6">Error 404</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          We couldn&apos;t find that page
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          The link may be out of date, or the page may have moved. Here are the
          two places you are most likely headed.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/dashboard"
            className={buttonClass({ variant: "primary", size: "md" })}
          >
            <LayoutDashboard aria-hidden="true" className="size-4" />
            Go to dashboard
          </Link>

          <Link
            href="/appointment"
            className={buttonClass({ variant: "outline", size: "md" })}
          >
            <CalendarDays aria-hidden="true" className="size-4" />
            View appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
