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

  const card = (
      <div className="group relative mx-auto flex w-full max-w-full flex-col items-stretch gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#00898F] hover:shadow-xl md:flex-row md:items-center md:gap-6 md:p-6 lg:max-w-[1440px] 2xl:max-w-[1920px]">
        {/* Date Box - Top on Mobile, Left on Desktop */}
        <div className="flex flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00898F] to-[#006B70] p-3 text-white shadow-md md:h-24 md:w-20 md:flex-col">
          <div className="mr-2 text-xs font-bold uppercase tracking-wider opacity-90 md:mr-0 md:text-sm">
            {month}
          </div>
          <div className="text-xl font-black md:text-3xl">{day}</div>
        </div>

        {/* Image Thumbnail - Responsive Sizing */}
        <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-64 md:h-32 md:w-48 2xl:w-64">
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
          <div className="absolute right-2 top-2 md:hidden">
            <Badge className="bg-white/90 text-[#00898F] backdrop-blur-sm">
              ₹{price}
            </Badge>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-2 md:space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="border-none bg-[#E1EBED] px-2.5 py-0.5 font-medium text-[#00898F]"
            >
              {language}
            </Badge>

            {isOnline && (
              <Badge className="border-green-100 bg-green-50 px-2.5 py-0.5 text-green-700">
                <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Online
              </Badge>
            )}

            {hasRecording && (
              <Badge className="border-orange-100 bg-orange-50 px-2.5 py-0.5 text-orange-700">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500" />
                Recording
              </Badge>
            )}
          </div>

          <h2 className="line-clamp-2 text-lg font-extrabold text-gray-900 md:text-xl 2xl:text-2xl">
            {title}
          </h2>

          <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-gray-600 md:line-clamp-3 md:text-base">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="hidden md:block">
              <InfoChip icon={<IndianRupee size={16} />} label={`${price}`} />
            </div>
            <InfoChip icon={<Clock size={16} />} label={timeSlot} />
          </div>
        </div>

        {/* Action Button - Full width on mobile, Auto on desktop */}
        {/* NOT a <Link>. The whole card is already wrapped in one pointing at the
            same href, and an <a> inside an <a> is invalid HTML — React refuses to
            hydrate it, discards the server-rendered markup and re-renders the
            entire page on the client. That showed up as a hydration error on
            /session and made the page visibly slower to settle. */}
        <div className="flex w-full flex-col items-center justify-center border-t border-gray-100 pt-4 md:w-auto md:items-end md:border-none md:pt-0">
          <InteractiveButton />
        </div>
      </div>
  );

  // `detailPath` is optional and `Link` requires a string href, so only wrap when
  // there is somewhere to go.
  return detailPath ? <Link href={detailPath}>{card}</Link> : card;
};

const InfoChip = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs md:text-sm font-semibold text-gray-700 border border-gray-100">
    <span className="text-[#00898F]">{icon}</span>
    {label}
  </div>
);