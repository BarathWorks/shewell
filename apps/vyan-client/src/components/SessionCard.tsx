"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, IndianRupee, Wifi, Video } from "lucide-react";

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

export const SessionCard: React.FC<SessionCardProps> = ({
  imageUrl,
  language = "English",
  isOnline = true,
  hasRecording = false,
  sessionDate,
  sessionTime,
  title,
  description,
  price,
  timeSlot,
  detailPath = "#",
}) => {
  const [imgError, setImgError] = useState(false);
  const dateObj = new Date(sessionDate);
  const month = dateObj
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const day = dateObj.getDate();
  const isFree = price === 0;

  return (
    <Link href={detailPath} className="block w-full">
      <div className="group flex w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#00898F]/25 hover:shadow-lg">

        {/* Date strip */}
        <div className="flex w-14 flex-shrink-0 flex-col items-center justify-center bg-[#00898F] py-5 sm:w-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            {month}
          </span>
          <span className="text-2xl font-extrabold leading-none text-white sm:text-3xl">
            {day}
          </span>
        </div>

        {/* Thumbnail */}
        <div className="relative hidden w-40 flex-shrink-0 overflow-hidden sm:block md:w-48 lg:w-52">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50">
              <Calendar className="h-8 w-8 text-gray-300" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">
                Session
              </span>
            </div>
          )}
          {/* Recording overlay badge */}
          {hasRecording && (
            <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              REC
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-4 md:px-5 md:py-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-[#00898F]/20 bg-[#E8F7F7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00898F]">
              {language}
            </span>
            {isOnline && (
              <span className="flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                <Wifi className="h-2.5 w-2.5" />
                Live Online
              </span>
            )}
            {hasRecording && (
              <span className="flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-500 sm:hidden">
                <Video className="h-2.5 w-2.5" />
                Recording
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 text-base font-extrabold leading-snug text-gray-900 group-hover:text-[#00898F] transition-colors duration-200 md:text-lg lg:text-xl">
            {title}
          </h3>

          {/* Description */}
          {description && description !== "Session" && (
            <p className="line-clamp-1 text-xs leading-relaxed text-gray-500 md:text-sm">
              {description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              {timeSlot}
            </span>
          </div>
        </div>

        {/* Right: price + CTA */}
        <div className="flex flex-shrink-0 flex-col items-end justify-center gap-3 border-l border-gray-100 px-4 py-4 md:px-5 md:min-w-[140px]">
          {/* Price */}
          <div className="flex flex-col items-end">
            {isFree ? (
              <span className="text-base font-extrabold text-[#00898F] md:text-lg">
                Free
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-base font-extrabold text-[#114668] md:text-lg">
                <IndianRupee className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* CTA */}
          <button className="w-full rounded-xl bg-[#00898F] px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-[#007a80] active:scale-95 md:px-5 md:py-2.5 md:text-sm">
            Register →
          </button>
        </div>

      </div>
    </Link>
  );
};

// ─── Info chip (kept for backward compat) ────────────────────────────────────
const InfoChip = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 md:text-sm">
    <span className="text-[#00898F]">{icon}</span>
    {label}
  </div>
);