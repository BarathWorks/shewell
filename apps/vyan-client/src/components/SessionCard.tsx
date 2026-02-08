"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, IndianRupee } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { InteractiveButton } from "../components/ui/interactive-button";

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
  hasRecording = true,
  sessionDate,
  sessionTime,
  title,
  description,
  price,
  timeSlot,
  detailPath,
}) => {
  const dateObj = new Date(sessionDate);
  const month = dateObj.toLocaleString("default", { month: "short" });
  const day = dateObj.getDate();

  return (
    <div className="group relative flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:border-[#00898F] max-w-full lg:max-w-[1440px] 2xl:max-w-[1920px] mx-auto w-full">
      
      {/* Date Box - Top on Mobile, Left on Desktop */}
      <div className="flex lg:flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#00898F] to-[#006B70] p-3 lg:h-24 lg:w-20 text-white flex-shrink-0 shadow-md">
        <div className="text-xs lg:text-sm uppercase font-bold tracking-wider opacity-90 mr-2 lg:mr-0">
          {month}
        </div>
        <div className="text-xl lg:text-3xl font-black">
          {day}
        </div>
      </div>

      {/* Image Thumbnail - Responsive Sizing */}
      <div className="relative h-48 sm:h-64 lg:h-32 w-full lg:w-48 2xl:w-64 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
            <Calendar size={32} />
          </div>
        )}
        {/* Mobile-only Price Badge overlay */}
        <div className="absolute top-2 right-2 lg:hidden">
            <Badge className="bg-white/90 text-[#00898F] backdrop-blur-sm">
                ₹{price}
            </Badge>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-2 lg:space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-[#E1EBED] text-[#00898F] font-medium border-none px-2.5 py-0.5">
            {language}
          </Badge>

          {isOnline && (
            <Badge className="bg-green-50 text-green-700 border-green-100 px-2.5 py-0.5">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </Badge>
          )}

          {hasRecording && (
            <Badge className="bg-orange-50 text-orange-700 border-orange-100 px-2.5 py-0.5">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500" />
              Recording
            </Badge>
          )}
        </div>

        <h2 className="text-lg lg:text-xl 2xl:text-2xl font-extrabold text-gray-900 line-clamp-2">
          {title}
        </h2>

        <p className="text-sm lg:text-base text-gray-600 line-clamp-2 lg:line-clamp-3 max-w-3xl leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="hidden lg:block">
            <InfoChip icon={<IndianRupee size={16} />} label={`${price}`} />
          </div>
          <InfoChip icon={<Clock size={16} />} label={timeSlot} />
        </div>
      </div>

      {/* Action Button - Full width on mobile, Auto on desktop */}
      <div className="flex flex-col items-center lg:items-end justify-center pt-4 lg:pt-0 border-t lg:border-none border-gray-100">
        {detailPath && (
          <Link href={detailPath} className="w-full lg:w-auto">
            <InteractiveButton />
          </Link>
        )}
      </div>
    </div>
  );
};

const InfoChip = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs lg:text-sm font-semibold text-gray-700 border border-gray-100">
    <span className="text-[#00898F]">{icon}</span>
    {label}
  </div>
);