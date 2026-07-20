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
        <div className="mb-0 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Upcoming Wellness Sessions
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            Join our expert-led sessions for your pregnancy journey
          </p>
        </div>

        {/* Empty state — full-width card layout */}
        <div className="w-full mt-6">
          <div className="bg-white rounded-[24px] p-6 md:p-10 text-center flex flex-col items-center gap-6 md:gap-8 w-full">
            
            {/* Illustration */}
            <div className="flex justify-center w-full">
              <img
                src="/no_sessions_illustration_clean.svg"
                alt="Medical calendar illustration"
                className="w-full max-w-xs h-auto object-cover rounded-2xl"
              />
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-gray-900">
                No Upcoming Sessions
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-500 max-w-md mx-auto">
                You don't have any sessions scheduled at the moment. Explore our upcoming sessions or book a consultation with a specialist.
              </p>
            </div>

            {/* Call to Action Cluster */}
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-2 justify-center">
              <Link href="/session" className="w-full sm:flex-1">
                <div className="group flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 rounded-[24px] bg-[#F2F2F2] p-3 h-[60px] transition-all duration-300 ease-in-out hover:bg-[#00898F] active:bg-[#006e72] sm:h-[70px] md:h-[80px] md:p-4">
                  <div className="flex flex-1 justify-center">
                    <span className="text-center font-poppins text-xs font-semibold uppercase tracking-[0.1em] text-[#00000066] transition-colors duration-300 group-hover:text-white group-active:text-white sm:text-sm md:text-base">
                      Explore Other Sessions
                    </span>
                  </div>
                  <InteractiveButton as="span" size="large" />
                </div>
              </Link>

              <Link href="/counselling" className="w-full sm:flex-1">
                <div className="group flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 rounded-[24px] bg-[#F2F2F2] p-3 h-[60px] transition-all duration-300 ease-in-out hover:bg-[#00898F] active:bg-[#006e72] sm:h-[70px] md:h-[80px] md:p-4">
                  <div className="flex flex-1 justify-center">
                    <span className="text-center font-poppins text-xs font-semibold uppercase tracking-[0.1em] text-[#00000066] transition-colors duration-300 group-hover:text-white group-active:text-white sm:text-sm md:text-base">
                      Book a Doctor
                    </span>
                  </div>
                  <InteractiveButton as="span" size="large" />
                </div>
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
              className="group flex w-full flex-col lg:flex-row items-center p-4 md:p-6 gap-6 bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-auto lg:h-[260px] overflow-hidden"
            >
              {/* Date badge — leftmost vertical strip */}
              <div
                className="flex-shrink-0 w-full lg:w-[80px] lg:h-[212px] h-[80px] bg-[#2C5F71] flex flex-row lg:flex-col items-center justify-center text-white rounded-[16px] gap-2 lg:gap-1"
                style={{ backgroundColor: "rgb(44, 95, 113)", borderRadius: "16px" }}
              >
                <span className="text-[16px] lg:text-[18px] font-bold tracking-widest uppercase">{month}</span>
                <span className="text-[28px] lg:text-[40px] font-bold leading-none">{day}</span>
              </div>

              {/* Left Module: Thumbnail */}
              <div
                className="relative flex-shrink-0 w-full lg:w-[360px] lg:h-[212px] h-[180px] overflow-hidden rounded-[16px] bg-[#F4F4F4]"
                style={{ borderRadius: "16px" }}
              >
                {session?.thumbnailMedia?.fileUrl ? (
                  <img
                    src={session.thumbnailMedia.fileUrl}
                    alt={session.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#F4F4F4]">
                    <Calendar className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                {/* Recording overlay badge */}
                {session.isRecordingAvailable && (
                  <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                    REC
                  </span>
                )}
              </div>

              {/* Right Module: Content */}
              <div className="flex flex-col justify-between flex-grow w-full lg:h-[212px] min-w-0 gap-4 lg:gap-2">
                
                {/* Top Header Row */}
                <div className="flex flex-row justify-between items-center w-full">
                  <div className="flex gap-2">
                    {/* Language Chip */}
                    <div className="bg-[#F4F4F4] px-4 py-1.5 rounded-full flex items-center">
                      <span className="text-[14px] font-normal text-black">{session.language || "English"}</span>
                    </div>
                    {/* Mode Chip */}
                    <div className="bg-[#F4F4F4] px-4 py-1.5 rounded-full flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.type === "ONLINE" ? "bg-green-500" : "bg-blue-400"}`}></div>
                      <span className="text-[14px] font-normal text-black">
                        {session.type === "ONLINE" ? "Online" : "In-Person"}
                      </span>
                    </div>
                    {/* Recording Benefit Chip */}
                    {session.isRecordingAvailable && (
                      <div className="bg-[#F4F4F4] px-4 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FFB13D]"></div>
                        <span className="text-[14px] font-normal text-black">Recording</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Round CTA Button */}
                  <Link href={`/session/${session.slug}`} className="flex-shrink-0">
                    <InteractiveButton
                      as="span"
                      variant="reverse"
                      size="large"
                      className="w-[64px] h-[64px] rounded-[24px] border border-gray-100 shadow-sm flex-shrink-0"
                    />
                  </Link>
                </div>

                {/* Main Info */}
                <div className="flex flex-col gap-1 min-w-0">
                  <h2 className="text-[20px] sm:text-[24px] lg:text-[32px] font-medium text-black leading-tight tracking-tight line-clamp-1">
                    {session.title}
                  </h2>
                  <p className="text-[14px] lg:text-[16px] font-normal text-black/70 line-clamp-1">
                    {session.overview || "No description available."}
                  </p>
                </div>

                {/* Bottom Row: Detail Chips */}
                <div className="flex flex-row flex-wrap gap-[20px] items-center">
                  {/* Price Chip */}
                  <div className="bg-[#E1EBED]/60 border border-[#00898F]/15 hover:bg-[#E1EBED] transition-all duration-300 px-6 py-2 rounded-lg flex items-center">
                    <span className="text-[20px] lg:text-[22px] font-bold text-[#00898F]" style={{ color: "rgb(0, 137, 143)" }}>
                      {Number(session.price) === 0 ? "Free" : `₹ ${Number(session.price).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  {/* Time Chip */}
                  <div className="bg-[#E1EBED]/60 border border-[#00898F]/15 hover:bg-[#E1EBED] transition-all duration-300 px-4 py-2 rounded-lg flex items-center gap-2 text-[#00898F]">
                    <Clock className="w-5 h-5 text-[#00898F]" />
                    <span className="text-[14px] lg:text-[15px] font-semibold text-gray-800">
                      {formatTime(startDate)} to {formatTime(endDate)} IST
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="mt-10 md:mt-14">
        <Link href="/session">
          <div className="group flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 rounded-[24px] bg-[#F2F2F2] p-4 h-[90px] transition-all duration-300 ease-in-out hover:bg-[#00898F] active:bg-[#006e72] sm:h-[100px] sm:p-5 md:h-[120px] md:p-6">
            <div className="flex flex-1 justify-center">
              <span className="text-center font-poppins text-lg font-semibold uppercase tracking-[0.2em] text-[#00000066] transition-colors duration-300 group-hover:text-white group-active:text-white sm:text-2xl md:text-[32px] md:leading-[48px]">
                EXPLORE ALL SESSIONS
              </span>
            </div>
            <InteractiveButton as="span" size="xlarge" />
          </div>
        </Link>
      </div>
    </section>
  );
}
