"use client";

import React from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Calendar, Clock } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";

export default function UpcomingSessions() {
  const { data: sessions, isLoading } =
    api.session.getUpcomingSessions.useQuery({
      limit: 4,
    });

  if (isLoading) {
    return (
      <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Upcoming Wellness Sessions
          </h2>
          <div className="mx-auto h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[420px] animate-pulse rounded-3xl bg-gray-100"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">

        {/* Section Header */}
        <div className="mb-10 sm:mb-12 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Upcoming Wellness Sessions
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            Join our expert-led sessions for your pregnancy journey
          </p>
        </div>

        {/* Empty state — editorial split layout */}
        <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 md:flex-row">

          {/* Left — teal panel with illustration */}
          <div className="relative flex min-h-[200px] w-full flex-shrink-0 flex-col items-center justify-center overflow-hidden bg-[#00898F] px-8 py-10 md:w-[42%] md:py-14">
            {/* Faint concentric circles — decorative */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[280px] w-[280px] rounded-full border border-white/10" />
              <div className="absolute h-[200px] w-[200px] rounded-full border border-white/10" />
              <div className="absolute h-[120px] w-[120px] rounded-full border border-white/10" />
            </div>
            {/* Illustration */}
            <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-white/15 sm:h-32 sm:w-32 md:h-36 md:w-36">
              <img
                src="/session-calender.png"
                alt="No sessions yet"
                className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-22 md:w-22"
              />
            </div>
            {/* Small label below */}
            <p className="relative z-10 mt-4 text-xs font-semibold uppercase tracking-widest text-white/60">
              Sessions
            </p>
          </div>

          {/* Right — content */}
          <div className="flex flex-1 flex-col justify-center px-7 py-9 sm:px-10 sm:py-10 md:px-12 md:py-12">

            {/* Label */}
            <span className="mb-3 inline-block w-fit rounded-md bg-[#00898F]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#00898F]">
              Coming soon
            </span>

            <h3 className="mb-3 text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-[#114668]">
              We're curating your next <br className="hidden sm:block" />
              wellness experience
            </h3>

            <p className="mb-6 text-sm sm:text-base leading-relaxed text-gray-500">
              Our team of specialists is handpicking sessions on prenatal care,
              nutrition, mental health, and more — designed around what matters
              most to you.
            </p>

            {/* Divider */}
            <div className="mb-6 h-px w-full bg-gray-100" />

            {/* Stats row */}
            <div className="mb-7 flex items-center gap-6 sm:gap-8">
              <div>
                <p className="text-lg font-bold text-[#114668] sm:text-xl">4.9★</p>
                <p className="text-xs text-gray-400">Avg session rating</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <p className="text-lg font-bold text-[#114668] sm:text-xl">50+</p>
                <p className="text-xs text-gray-400">Expert specialists</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <p className="text-lg font-bold text-[#114668] sm:text-xl">110+</p>
                <p className="text-xs text-gray-400">Countries served</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/counselling">
                <button className="w-full rounded-xl bg-[#114668] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0d3554] active:scale-95 sm:w-auto">
                  Book a 1-on-1 Session
                </button>
              </Link>
              <Link
                href="/session"
                className="text-center text-sm text-[#00898F] underline-offset-4 hover:underline sm:text-left"
              >
                Browse all sessions →
              </Link>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      {/* Section Header */}
      <div className="mb-8 sm:mb-10 md:mb-12 text-center">
        <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
          Upcoming Wellness Sessions
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
          Join our expert-led sessions for your pregnancy journey
        </p>
      </div>

      {/* Session List */}
      <div className="flex flex-col gap-4">
        {sessions.map((session) => {
          const startDate = new Date(session.startAt);
          const endDate = new Date(
            startDate.getTime() + (session.durationInMins ?? 60) * 60 * 1000,
          );
          const month = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
          const day = startDate.getDate();

          const formatTime = (d: Date) =>
            d.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

          return (
            <div
              key={session.id}
              className="group flex w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#00898F]/20 hover:shadow-md"
            >
              {/* Date badge — left vertical strip */}
              <div className="flex w-14 flex-shrink-0 flex-col items-center justify-center bg-[#00898F] py-4 sm:w-16">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  {month}
                </span>
                <span className="text-2xl font-extrabold leading-none text-white sm:text-3xl">
                  {day}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="relative hidden h-auto w-28 flex-shrink-0 overflow-hidden sm:block sm:w-36 md:w-44">
                {session?.thumbnailMedia?.fileUrl ? (
                  <img
                    src={session.thumbnailMedia.fileUrl}
                    alt={session.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50">
                    <Calendar className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                {/* Recording badge */}
                {session.isRecordingAvailable && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Rec
                  </span>
                )}
              </div>

              {/* Main content */}
              <div className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-4 sm:py-3 md:px-5">
                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {session.language && (
                    <span className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {session.language}
                    </span>
                  )}
                  {session.type === "ONLINE" && (
                    <span className="flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Live Online
                    </span>
                  )}
                  {session.isRecordingAvailable && (
                    <span className="flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-500 sm:hidden">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      Recording
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="line-clamp-1 text-sm font-bold text-gray-900 sm:text-base md:text-lg">
                  {session.title}
                </h3>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {formatTime(startDate)} – {formatTime(endDate)} IST
                  </span>
                  {session.durationInMins && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span>{session.durationInMins} mins</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: price + CTA */}
              <div className="flex flex-shrink-0 flex-col items-end justify-center gap-2 px-4 py-4 sm:px-5">
                <span className="text-sm font-bold text-[#114668] sm:text-base">
                  {Number(session.price) === 0
                    ? "Free"
                    : `₹ ${Number(session.price).toLocaleString()}`}
                </span>
                <Link href={`/session/${session.slug}`}>
                  <button className="rounded-lg bg-[#00898F] px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-[#007a80] active:scale-95 sm:text-sm sm:px-5 sm:py-2.5">
                    Register
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="mt-10 md:mt-14">
        <Link href="/session">
          <div className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl bg-[#F2F2F2] px-5 py-4 transition-all duration-300 ease-in-out hover:bg-[#00898F] sm:rounded-2xl sm:px-6 sm:py-5 md:px-8">
            <div className="flex flex-1 justify-center">
              <span className="text-center text-sm sm:text-base md:text-lg font-medium tracking-[0.15em] text-[#00000066] group-hover:text-white">
                EXPLORE ALL SESSIONS
              </span>
            </div>
            <InteractiveButton as="span" />
          </div>
        </Link>
      </div>
    </section>
  );
}
