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
    <section className="w-full bg-[#F0F9FA] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                Join the Live Session
              </h3>
              <p className="text-gray-600">
                Click the button below to join "{sessionTitle}"
              </p>
            </div>
            <Button
              asChild
              size="large"
              className="bg-teal-600 hover:bg-teal-700"
            >
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Join Meeting
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
