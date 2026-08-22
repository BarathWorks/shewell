"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

interface SessionCardProps {
  imageUrl?: string;
  language?: string;
  isOnline?: boolean;
  hasRecording?: boolean;
  sessionDate: string;
  sessionTime: string;
  title: string;
  description: string;
  date: string;
  price: number;
  timeSlot: string;
  detailPath?: string;
}

/**
 * A session in a list.
 *
 * The prop interface is unchanged, so every existing call site keeps working.
 *
 * This is now the only session card in the listing. `/session` previously
 * rendered two completely separate implementations — a ~130-line inline card
 * under `md:hidden` and this component under `hidden md:block` — which had
 * drifted into different type scales, different badge colours, different
 * corner radii and different price treatments. The same session looked like two
 * different products depending on the width of the window. One responsive card
 * replaces both.
 *
 * The nested `<a>` fix from before is preserved: the whole card is the link, so
 * nothing inside it may be a link too.
 */
export const SessionCard: React.FC<SessionCardProps> = ({
  imageUrl,
  language = "English",
  isOnline = true,
  hasRecording = true,
  sessionDate,
  title,
  description,
  price,
  timeSlot,
  detailPath,
}) => {
  const dateObj = new Date(sessionDate);
  const month = dateObj.toLocaleString("default", { month: "short" });
  const day = dateObj.getDate();

  const card = (
    <article className="surface-card surface-card-interactive group flex h-full w-full flex-col overflow-hidden md:flex-row">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100 md:aspect-auto md:h-auto md:w-56 lg:w-64">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-300">
            <CalendarDays aria-hidden="true" className="size-10" />
          </div>
        )}

        {/* Date chip */}
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-lg border border-white/70 bg-surface/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-2xs font-semibold uppercase tracking-wider text-primary-600">
            {month}
          </span>
          <span className="text-lg font-semibold leading-none text-ink">
            {day}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-hairline bg-slate-50 px-2 py-1 text-2xs font-medium text-body">
            {language}
          </span>

          {isOnline && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-success-100 bg-success-50 px-2 py-1 text-2xs font-medium text-secondary-700">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-secondary-500"
              />
              Online
            </span>
          )}

          {hasRecording && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-info-100 bg-info-50 px-2 py-1 text-2xs font-medium text-info-600">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-info-500"
              />
              Recording
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-ink md:text-lg">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {description}
        </p>

        {timeSlot ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-body">
            <Clock aria-hidden="true" className="size-4 shrink-0 text-primary-500" />
            {timeSlot}
          </p>
        ) : null}

        <div className="flex-1" />

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline pt-4">
          <span className="text-base font-semibold text-ink">
            ₹{Number(price).toLocaleString("en-IN")}
          </span>

          {/* Deliberately not a <Link>: the whole card is already one, and an
              <a> inside an <a> is invalid HTML that React refuses to hydrate. */}
          <span className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary-600 bg-primary-600 px-4 text-sm font-medium text-white transition-colors duration-200 group-hover:border-primary-700 group-hover:bg-primary-700">
            Register
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </article>
  );

  // `detailPath` is optional and `Link` requires a string href, so only wrap when
  // there is somewhere to go.
  return detailPath ? (
    <Link
      href={detailPath}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  ) : (
    card
  );
};
