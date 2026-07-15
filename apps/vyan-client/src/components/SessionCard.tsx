"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, IndianRupee, Wifi, Video, Globe, Star } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";

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
      <div className="group flex w-full flex-col lg:flex-row items-center p-4 md:p-6 gap-6 bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-auto lg:h-[260px] overflow-hidden">
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
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#F4F4F4]">
              <Calendar className="h-10 w-10 text-gray-300" />
            </div>
          )}
          {/* Recording overlay badge */}
          {hasRecording && (
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
                <span className="text-[14px] font-normal text-black">{language}</span>
              </div>
              {/* Mode Chip */}
              <div className="bg-[#F4F4F4] px-4 py-1.5 rounded-full flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-blue-400"}`}></div>
                <span className="text-[14px] font-normal text-black">
                  {isOnline ? "Online" : "In-Person"}
                </span>
              </div>
              {/* Recording Benefit Chip */}
              {hasRecording && (
                <div className="bg-[#F4F4F4] px-4 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FFB13D]"></div>
                  <span className="text-[14px] font-normal text-black">Recording</span>
                </div>
              )}
            </div>
            
            {/* Round CTA Button */}
            <InteractiveButton
              as="span"
              variant="reverse"
              size="large"
              className="w-[64px] h-[64px] rounded-[24px] border border-gray-100 shadow-sm flex-shrink-0"
            />
          </div>

          {/* Main Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="text-[20px] sm:text-[24px] lg:text-[32px] font-medium text-black leading-tight tracking-tight line-clamp-1">
              {title}
            </h2>
            <p className="text-[14px] lg:text-[16px] font-normal text-black/70 line-clamp-1">
              {description && description !== "Session" ? description : "No description available."}
            </p>
          </div>

          {/* Bottom Row: Detail Chips */}
          <div className="flex flex-row flex-wrap gap-[20px] items-center">
            {/* Price Chip */}
            <div className="bg-[#E1EBED]/60 border border-[#00898F]/15 hover:bg-[#E1EBED] transition-all duration-300 px-6 py-2 rounded-lg flex items-center">
              <span className="text-[20px] lg:text-[22px] font-bold text-[#00898F]" style={{ color: "rgb(0, 137, 143)" }}>
                {isFree ? "Free" : `₹ ${price.toLocaleString("en-IN")}`}
              </span>
            </div>
            {/* Time Chip */}
            <div className="bg-[#E1EBED]/60 border border-[#00898F]/15 hover:bg-[#E1EBED] transition-all duration-300 px-4 py-2 rounded-lg flex items-center gap-2 text-[#00898F]">
              <Clock className="w-5 h-5 text-[#00898F]" />
              <span className="text-[14px] lg:text-[15px] font-semibold text-gray-800">
                {timeSlot}
              </span>
            </div>
          </div>

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