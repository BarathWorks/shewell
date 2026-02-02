"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingLinkSectionProps {
  meetingLink: string;
  sessionTitle: string;
}

export const MeetingLinkSection = ({
  meetingLink,
  sessionTitle,
}: MeetingLinkSectionProps): JSX.Element => {
  return (
    <section className="w-full bg-[#F0F9FA] px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-6 sm:py-8 lg:py-10 xl:py-12 2xl:py-14">
      <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]">
        <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 shadow-sm">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 xl:gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="mb-1.5 sm:mb-2 text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900">
                Join the Live Session
              </h3>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
                Click the button below to join "{sessionTitle}"
              </p>
            </div>
            <Button
              asChild
              size="large"
              className="bg-teal-600 hover:bg-teal-700 text-sm sm:text-base lg:text-lg"
            >
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Join Meeting
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};