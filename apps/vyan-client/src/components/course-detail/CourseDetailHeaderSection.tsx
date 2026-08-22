"use client";
import { CalendarDays, Clock, Languages } from "lucide-react";

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

/**
 * Session detail masthead.
 *
 * Same props, same content. The band was `#F5F5F3` — a warm grey belonging to no
 * palette — with the date and time as two pill-shaped white bars whose height was
 * respecified at four breakpoints. They are a labelled two-up panel now, so it is
 * clear which value is the date and which is the time; previously both were bare
 * strings distinguished only by a trailing icon.
 */
export const CourseDetailHeaderSection = ({
  title,
  instructor,
  language,
  isOnline,
  hasRecording,
  date,
  time,
}: CourseDetailHeaderSectionProps): JSX.Element => {
  return (
    <section className="w-full border-b border-hairline bg-surface">
      <div className="container-page flex flex-col justify-between gap-8 py-10 md:py-14 lg:flex-row lg:items-end lg:gap-12">
        {/* Title */}
        <div className="max-w-3xl">
          <p className="eyebrow">Session</p>

          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-3 text-base text-body sm:text-lg">
            with {instructor}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-body">
              <Languages aria-hidden="true" className="size-3.5" />
              {language}
            </span>

            {isOnline && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-success-100 bg-success-50 px-2.5 py-1.5 text-xs font-medium text-secondary-700">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-secondary-500"
                />
                Online
              </span>
            )}

            {hasRecording && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-info-100 bg-info-50 px-2.5 py-1.5 text-xs font-medium text-info-600">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-info-500"
                />
                Recording
              </span>
            )}
          </div>
        </div>

        {/* When */}
        <dl className="surface-card grid w-full shrink-0 grid-cols-2 divide-x divide-hairline lg:w-auto lg:min-w-[22rem]">
          <div className="flex flex-col gap-1.5 p-4 sm:p-5">
            <dt className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-muted">
              <CalendarDays aria-hidden="true" className="size-3.5 text-primary-500" />
              Date
            </dt>
            <dd className="text-sm font-semibold text-ink sm:text-base">
              {date}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5 p-4 sm:p-5">
            <dt className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-muted">
              <Clock aria-hidden="true" className="size-3.5 text-primary-500" />
              Time
            </dt>
            <dd className="text-sm font-semibold text-ink sm:text-base">
              {time}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
