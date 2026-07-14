"use client";

import React from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Calendar } from "lucide-react";
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
      <section className="flex min-h-[70vh] w-full flex-col bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Upcoming Wellness Sessions
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            Join our expert-led sessions for your pregnancy journey
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-[20px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-sm sm:p-10 md:p-16">
            <div className="mb-6 flex w-full items-center justify-center">
              <img
                src="/session-calender.png"
                alt="No upcoming sessions"
                className="h-40 w-40 object-contain sm:h-48 sm:w-48 md:h-56 md:w-56"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <h3 className="mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                New Sessions Coming Soon
              </h3>
              <p className="max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-gray-600">
                We're currently scheduling our next round of expert-led
                pregnancy and health workshops.
              </p>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sessions.map((session) => {
          const startDate = new Date(session.startAt);
          const month = startDate.toLocaleString("default", { month: "short" });
          const day = startDate.getDate();

          return (
            <div
              key={session.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              {/* Header Image */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-100">
                {session?.thumbnailMedia?.fileUrl ? (
                  <img
                    src={session.thumbnailMedia.fileUrl}
                    alt={session.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                    <Calendar className="h-12 w-12 opacity-50" />
                  </div>
                )}

                {/* Date Ribbon */}
                <div className="absolute right-3 top-0 flex h-[65px] w-[48px] flex-col items-center justify-start rounded-b-lg bg-[#1B8A8E] pt-2 text-white shadow-md">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                      {month}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {day}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-10px",
                      left: 0,
                      width: "100%",
                      height: "20px",
                      backgroundColor: "#1B8A8E",
                      clipPath: "polygon(0 0, 50% 50%, 100% 0)",
                    }}
                  ></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Tags */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#E3F6F5] px-2.5 py-1 text-xs font-semibold text-[#1B8A8E]">
                    {session.language || "English"}
                  </span>
                  {session.type === "ONLINE" && (
                    <span className="flex items-center gap-1.5 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      Online
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-base sm:text-lg font-bold leading-tight text-gray-900">
                  {session.title}
                </h3>

                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                  A comprehensive session focusing on health and wellness. Join
                  us to learn from the best experts in the field.
                </p>

                <div className="flex-1"></div>

                {/* Footer: Price & Action */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex h-10 min-w-[88px] items-center justify-center rounded-lg border border-[#1B8A8E] bg-white text-sm font-bold text-[#1B8A8E]">
                    ₹ {Number(session.price).toLocaleString()}
                  </div>

                  <Link href={`/session/${session.slug}`} className="flex-1">
                    <button className="flex h-10 w-full items-center justify-center rounded-lg bg-[#1B8A8E] px-4 text-sm font-bold text-white transition-colors hover:bg-[#156f73]">
                      Register
                    </button>
                  </Link>
                </div>
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
