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
      <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 py-8 sm:px-6 sm:py-12 md:px-12 lg:px-[100px]">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            Upcoming Sessions
          </h2>
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
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
    return null;
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 py-8 sm:px-6 sm:py-12 md:px-12 lg:px-[100px]">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end md:items-center">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            Upcoming Sessions
          </h2>
          <p className="text-gray-500">
            Join our expert-led sessions for your pregnancy journey
          </p>
        </div>
        <Link
          href="/session"
          className="group flex items-center gap-3 rounded-lg bg-gray-50 px-5 py-2 transition-all hover:bg-[#00898F] "
        >
          <span className="font-semibold text-gray-900 group-hover:text-white">
            Explore All Sessions
          </span>
          <InteractiveButton />
        </Link>
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
      {/* <div
                className="mt-8 flex w-full justify-center sm:mt-10 md:mt-12 lg:mt-16"
                onClick={() => (window.location.href = "/counselling")}
              >
                <div className="order-0 group flex h-11 w-full max-w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-[#F2F2F2] px-4 py-2 transition-all duration-300 ease-in-out hover:bg-[#e5e5e5] sm:h-14 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-3 md:h-16 md:rounded-2xl md:px-6 lg:h-20 lg:px-8">
                  <div className="flex flex-1 justify-center">
                    <span className="text-center text-xs font-semibold text-[#00000066] sm:text-sm md:text-base lg:text-lg xl:text-xl">
                      Explore All Sessions with our experts
                    </span>
                  </div>
                  <InteractiveButton />
                </div>
              </div> */}
    </section>
  );
}
