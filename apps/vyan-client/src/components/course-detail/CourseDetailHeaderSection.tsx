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
    <section className="w-full bg-[#F5F5F3] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 xl:px-16 xl:py-14 2xl:px-20 2xl:py-16">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:gap-8 lg:flex-row lg:gap-10 xl:max-w-[1400px] xl:gap-12 2xl:max-w-[1600px]">
        {/* LEFT CONTENT */}
        <div className="max-w-3xl">
          <h1
            style={{ lineHeight: "1.2" }}
            className="mb-2 text-2xl font-extrabold text-[#2E2E2E] sm:mb-3 sm:text-3xl lg:text-[40px] xl:text-[48px] 2xl:text-[56px]"
          >
            {title}
          </h1>

          <p className="mb-4 text-sm text-[#5E5E5E] sm:mb-5 sm:text-base lg:mb-6 lg:text-lg xl:text-xl">
            with {instructor}
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Badge className="lg:text-md gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 sm:px-3 sm:py-2 sm:text-sm lg:px-4">
              <Languages
                size={12}
                className="sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
              />
              {language}
            </Badge>

            {isOnline && (
              <Badge className="lg:text-md flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs sm:gap-2 sm:px-3 sm:py-2 sm:text-sm lg:px-4">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 sm:h-2 sm:w-2" />
                Online
              </Badge>
            )}

            {hasRecording && (
              <Badge className="lg:text-md rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm lg:px-4">
                Recording
              </Badge>
            )}
          </div>
        </div>

        {/* RIGHT – DATE & TIME DISPLAY */}
        <div className="flex w-full max-w-[320px] flex-col gap-3 sm:max-w-[340px] sm:gap-4 lg:max-w-[360px] xl:max-w-[400px]">
          {/* DATE CARD */}
          <div className="flex h-[52px] items-center justify-between rounded-full bg-white px-4 sm:h-[56px] sm:px-5 lg:h-[64px] lg:px-6 xl:h-[72px]">
            <span className="text-sm font-semibold text-teal-600 sm:text-base lg:text-lg">
              {date}
            </span>
            <Calendar
              size={18}
              strokeWidth={2}
              className="h-4 w-4 text-teal-600 sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px] xl:h-6 xl:w-6"
            />
          </div>

          {/* TIME CARD */}
          <div className="flex h-[52px] items-center justify-between rounded-full bg-white px-4 sm:h-[56px] sm:px-5 lg:h-[64px] lg:px-6 xl:h-[72px]">
            <span className="text-sm font-semibold text-teal-600 sm:text-base lg:text-lg">
              {time}
            </span>
            <Clock className="h-4 w-4 text-teal-600 sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px] xl:h-6 xl:w-6" />
          </div>
        </div>
      </div>
    </section>
  );
};
