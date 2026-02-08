"use client";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Languages } from "lucide-react";

import { Media } from "@/types/media";

interface CourseDetailHeaderSectionProps {
  title: string;
  instructor: string;
  language: string;
  isOnline: boolean;
  hasRecording: boolean;
  date: string;
  banners: Media[];
  time: string;
}

export const CourseDetailHeaderSection = ({
  title,
  instructor,
  language,
  isOnline,
  hasRecording,
  banners,
  date,
  time,
}: CourseDetailHeaderSectionProps): JSX.Element => {
  return (
    <section className="w-full bg-[#F5F5F3] px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-8 sm:py-10 lg:py-12 xl:py-14 2xl:py-16">
      <div className="mx-auto flex max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] flex-col justify-between gap-6 sm:gap-8 lg:gap-10 xl:gap-12 lg:flex-row">
        {/* LEFT CONTENT */}
        <div className="max-w-3xl">
          <h1 className="mb-2 sm:mb-3 text-2xl sm:text-3xl lg:text-[40px] xl:text-[48px] 2xl:text-[56px] font-extrabold text-[#2E2E2E]">
            {title}
          </h1>

          <p className="mb-4 sm:mb-5 lg:mb-6 text-sm sm:text-base lg:text-lg xl:text-xl text-[#5E5E5E]">with {instructor}</p>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Badge className="text-xs sm:text-sm lg:text-md gap-1 rounded-full border border-gray-200 bg-white px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-gray-800">
              <Languages size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              {language}
            </Badge>

            {isOnline && (
              <Badge className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 bg-white px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-md">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
                Online
              </Badge>
            )}

            {hasRecording && (
              <Badge className="rounded-full border border-gray-200 bg-white px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-md">
                Recording
              </Badge>
            )}
          </div>
        </div>

        {/* RIGHT – DATE & TIME DISPLAY */}
        <div className="flex w-full max-w-[320px] sm:max-w-[340px] lg:max-w-[360px] xl:max-w-[400px] flex-col gap-3 sm:gap-4">
          {/* DATE CARD */}
          <div className="flex h-[52px] sm:h-[56px] lg:h-[64px] xl:h-[72px] items-center justify-between rounded-full bg-white px-4 sm:px-5 lg:px-6">
            <span className="font-semibold text-teal-600 text-sm sm:text-base lg:text-lg">{date}</span>
            <Calendar size={18} strokeWidth={2} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px] xl:w-6 xl:h-6 text-teal-600" />
          </div>

          {/* TIME CARD */}
          <div className="flex h-[52px] sm:h-[56px] lg:h-[64px] xl:h-[72px] items-center justify-between rounded-full bg-white px-4 sm:px-5 lg:px-6">
            <span className="font-semibold text-teal-600 text-sm sm:text-base lg:text-lg">{time}</span>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px] xl:w-6 xl:h-6 text-teal-600" />
          </div>
        </div>
      </div>
    </section>
  );
};