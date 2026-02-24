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
      <section className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 px-4 py-8 sm:px-6 sm:py-12 md:px-12 lg:px-[100px]">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-medium text-gray-900 sm:mb-4 sm:text-3xl md:text-5xl lg:text-5xl xl:text-[48px]">
            Upcoming Wellness Sessions
          </h2>
          <div className="mx-auto h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[450px] animate-pulse rounded-3xl bg-gray-100"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <section className="flex h-[80vh] w-full flex-col bg-gradient-to-b from-white to-gray-50 px-4 py-8 sm:px-6 sm:py-12 md:px-12 lg:px-[100px]">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-medium text-gray-900 sm:mb-4 sm:text-3xl md:text-5xl lg:text-5xl xl:text-[48px]">
            Upcoming Wellness Sessions
          </h2>
          <p className="text-xs text-[#33333399] sm:text-sm md:text-lg lg:text-lg xl:text-[24px]">
            Join our expert-led sessions for your pregnancy journey
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-[20px] border-2 border-dashed border-gray-300 bg-white p-12 shadow-sm sm:p-16 md:p-20">
            {/* Image area */}
            <div className="mb-6 flex w-full items-center justify-center">
              <img
                src="/session-calender.png"
                alt="No upcoming sessions"
                className="h-40 w-40 object-contain sm:h-48 sm:w-48 md:h-56 md:w-56"
              />
            </div>

            {/* Content area */}
            <div className="flex flex-col items-center text-center">
              <h3 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                New Sessions Coming Soon
              </h3>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
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
    <section className="min-h-fit w-full bg-gradient-to-b from-white to-gray-50 px-4 py-4 sm:min-h-[85vh] sm:px-6 sm:py-12 md:px-12 lg:px-[100px]">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-medium text-gray-900 sm:mb-4 sm:text-3xl md:text-5xl lg:text-5xl xl:text-[48px]">
          Upcoming Wellness Sessions
        </h2>
        <p className="text-xs text-[#33333399] sm:text-sm md:text-lg lg:text-lg xl:text-[24px]">
          Join our expert-led sessions for your pregnancy journey
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sessions.map((session) => {
          const startDate = new Date(session.startAt);
          const month = startDate.toLocaleString("default", { month: "short" });
          const day = startDate.getDate();

          return (
            <div
              key={session.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              {/* Header Image Area */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
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
                <div className="absolute right-4 top-0 flex h-[70px] w-[50px] flex-col items-center justify-start rounded-b-lg bg-[#1B8A8E] pt-2 text-white shadow-md">
                  {/* Simplified Ribbon Shape using clip-path or just a rounded bottom div for now to match style roughly */}
                  {/* To match the screenshot exactly requires SVG path, simplified here */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                      {month}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {day}
                    </span>
                  </div>
                  {/* Triangle bottom for ribbon effect */}
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

              {/* Content Area */}
              <div className="flex flex-1 flex-col p-5">
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
                <h3 className="mb-2 line-clamp-2 text-xl font-extrabold leading-tight text-gray-900">
                  {session.title}
                </h3>

                {/* Description placeholder logic - ideally fetch from DB if available in summary */}
                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                  A comprehensive session focusing on health and wellness. Join
                  us to learn from the best experts in the field.
                </p>

                {/* Spacer to push footer down */}
                <div className="flex-1"></div>

                {/* Footer: Price & Action */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex h-[42px] min-w-[90px] items-center justify-center rounded-lg border border-[#1B8A8E] bg-white text-base font-bold text-[#1B8A8E]">
                    ₹ {Number(session.price).toLocaleString()}
                  </div>

                  <Link href={`/session/${session.slug}`} className="flex-1">
                    <button className="flex h-[42px] w-full items-center justify-center rounded-lg bg-[#1B8A8E] px-4 text-sm font-bold text-white transition-colors hover:bg-[#156f73]">
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
      <div
        className="mt-8 flex w-full justify-center sm:mt-10 md:mt-14 lg:mt-16"
        onClick={() => (window.location.href = "/session")}
      >
        <div className="order-0 group flex w-full max-w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-[#F2F2F2] px-4 py-2 transition-all duration-300 ease-in-out hover:bg-[#00898F] xs:h-16 xs:py-2 sm:h-12 sm:h-14 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-4 md:h-20 md:h-[70px] md:rounded-2xl md:px-7 lg:h-20 lg:px-8 xl:h-24">
          <div className="flex flex-1 justify-center">
            <span className="text-center text-xs font-medium tracking-[0.2em] text-[#00000066] group-hover:text-white sm:text-sm md:text-[16px] lg:text-[24px] xl:text-[28px]">
              EXPLORE ALL SESSIONS
            </span>
          </div>
          <InteractiveButton />
        </div>
      </div>
    </section>
  );
}
