"use client";

import React from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { ArrowRight, CalendarDays } from "lucide-react";
import SectionHeader from "./section-header";

/**
 * Upcoming sessions.
 *
 * Visual rework only — same query, same `limit: 4`, same three states, same
 * `/session/[slug]` destinations.
 *
 * Two things worth naming:
 *  - The loading and empty states were `min-h-screen` / `min-h-[80vh]`. A skeleton
 *    a full viewport tall collapses to the height of four cards the instant data
 *    arrives, which is a large layout shift on the busiest section of the home
 *    page. All three states share one section shell now, so the block is the same
 *    height before and after loading.
 *  - The "Explore all sessions" control was a `<div>` with an `onClick` that set
 *    `window.location.href`. Visually it is now a proper link — keyboard
 *    reachable, focusable, and it navigates on Enter — but the destination is
 *    unchanged.
 */

const HEADER = {
  eyebrow: "Live and guided",
  title: "Upcoming Wellness Sessions",
  lead: "Join our expert-led sessions for your pregnancy journey.",
} as const;

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="section-y bg-canvas">
      <div className="container-page">
        <SectionHeader {...HEADER} />
        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  );
}

export default function UpcomingSessions() {
  const { data: sessions, isLoading } =
    api.session.getUpcomingSessions.useQuery({
      limit: 4,
    });

  if (isLoading) {
    return (
      <SectionShell>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="surface-card overflow-hidden">
              <div className="skeleton h-44 rounded-none" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton mt-4 h-11 w-full" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <SectionShell>
        <div className="surface-card mx-auto flex max-w-2xl flex-col items-center px-6 py-14 text-center sm:px-10">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <CalendarDays aria-hidden="true" className="size-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-ink">
            New Sessions Coming Soon
          </h3>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-body">
            We&apos;re currently scheduling our next round of expert-led
            pregnancy and health workshops.
          </p>
          <Link
            href="/session"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg border border-hairline-strong bg-surface px-5 text-sm font-medium text-ink transition-colors duration-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800"
          >
            Browse all sessions
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {sessions.map((session) => {
          const startDate = new Date(session.startAt);
          const month = startDate.toLocaleString("default", { month: "short" });
          const day = startDate.getDate();

          return (
            <li key={session.id} className="flex">
              <article className="surface-card surface-card-interactive group flex w-full flex-col overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {session?.thumbnailMedia?.fileUrl ? (
                    <img
                      src={session.thumbnailMedia.fileUrl}
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
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-hairline bg-slate-50 px-2 py-1 text-2xs font-medium text-body">
                      {session.language || "English"}
                    </span>
                    {session.type === "ONLINE" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-success-100 bg-success-50 px-2 py-1 text-2xs font-medium text-secondary-700">
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-secondary-500"
                        />
                        Online
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-ink">
                    {session.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                    A comprehensive session focusing on health and wellness. Join
                    us to learn from the best experts in the field.
                  </p>

                  <div className="flex-1" />

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline pt-4">
                    <span className="text-base font-semibold text-ink">
                      ₹{Number(session.price).toLocaleString("en-IN")}
                    </span>

                    <Link
                      href={`/session/${session.slug}`}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary-600 bg-primary-600 px-4 text-sm font-medium text-white transition-all duration-200 hover:border-primary-700 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
                    >
                      Register
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex justify-center md:mt-12">
        <Link
          href="/session"
          className="group inline-flex h-12 items-center gap-2 rounded-lg border border-hairline-strong bg-surface px-6 text-sm font-medium text-ink transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:text-base"
        >
          Explore all sessions
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </SectionShell>
  );
}
