"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@repo/ui/src/@/components/button";

import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

import CounsellingAppointment from "./counselling-appointment";
import Link from "next/link";
import DayNavigatorWithTimeSlots from "./dateWithTimeSlots";
import Image from "next/image";
interface IDoctorProfileProps {
  // doctorProfile: IProfessionalUser;
  doctorProfile: {
    id?: string;
    firstName?: string | null;
    displayQualification?: {
      specialization?: string | null;
    } | null;
    avgRating?: string | null | undefined;
    totalConsultations?: number | null;
    userName?: string | null;
    languages?: {
      language?: string;
    }[];
    media?: {
      fileUrl?: string | null;
    } | null;
  };

  // cardImage: React.ReactNode;
  specialization?: {
    specialization?: string;
  }[];
  isCouple: boolean;
}

const CompleteDoctorProfile = ({
  doctorProfile,
  // cardImage,
  specialization,
  isCouple,
}: IDoctorProfileProps) => {
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Date | null;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  } | null>(null);
  const [price, setPrice] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const handleDuration = (value: number) => {
    setDuration(value);
  };

  const handleDateTimeSelect = (dateTime: {
    date: Date;
    // timeSlots: { startTime: Date; endTime: Date }[];
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }) => {
    setSelectedDateTime(dateTime);
  };

  // const handleReselectTimeSlot = () => {
  //   setSelectedDateTime(null);
  // };
  const handlePrice = (price: number) => {
    setPrice(price);
  };
  // console.log("component", price);

  useEffect(() => {
    setSelectedDateTime(null);
  }, [duration]);
  // console.log("parentComponent", selectedDateTime);
  const StarDrawing = (
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );
  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#00898F",
    inactiveFillColor: "#E0E0E0",
  };

  return (
    <article className="surface-card surface-card-interactive group flex h-full w-full flex-col gap-6 p-5 sm:p-6">
      {/* Identity */}
      <div className="flex gap-4 sm:gap-5">
        <div className="relative size-20 shrink-0 sm:size-24">
          <div className="relative size-full overflow-hidden rounded-full border border-hairline bg-slate-100">
            <Image
              src={
                doctorProfile.media?.fileUrl ||
                "/images/fallback-user-profile.png"
              }
              alt=""
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill={true}
              sizes="96px"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-lg font-semibold leading-tight text-ink sm:text-xl">
              {doctorProfile.firstName}
            </h3>

            {/*
              This was `href={`counselling/${userName}`}` — no leading slash, so it
              resolved relative to whatever path the card happened to be rendered
              on. It only reached the right place from `/counselling`; anywhere
              else it produced `/counselling/counselling/<name>`. It was also a
              bare SVG with no accessible name, announced as "link" and nothing
              more.
            */}
            <Link
              href={`/counselling/${doctorProfile.userName}`}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline px-2.5 text-xs font-medium text-primary-700 transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            >
              View profile
            </Link>
          </div>

          <p className="text-sm font-medium text-primary-700">
            {doctorProfile.displayQualification?.specialization}
          </p>

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Rating
                className="inline"
                readOnly={true}
                style={{ maxWidth: 64 }}
                value={parseFloat(doctorProfile.avgRating || "0")}
                itemStyles={customStyles}
              />
              <span className="text-xs font-semibold text-ink">
                {parseFloat(doctorProfile.avgRating || "0").toFixed(1)}
              </span>
            </span>
            <span className="text-xs text-muted">
              {doctorProfile?.totalConsultations || 0} consultations
            </span>
          </div>

          {/* Languages and specialities */}
          <div className="flex flex-wrap items-center gap-1.5">
            {doctorProfile.languages?.map((item, index) => (
              <span
                className="inline-flex items-center rounded-md border border-hairline bg-slate-50 px-2 py-1 text-2xs font-medium text-body"
                key={`lang-${index}`}
              >
                {item.language}
              </span>
            ))}
            {specialization?.map((item, index) => (
              <span
                className="inline-flex items-center rounded-md border border-primary-100 bg-primary-50 px-2 py-1 text-2xs font-medium text-primary-800"
                key={`spec-${index}`}
              >
                {item.specialization}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="border-t border-hairline pt-5">
        <DayNavigatorWithTimeSlots
          onSelectDuration={handleDuration}
          onSelectDateTime={handleDateTimeSelect}
          professionalUserId={doctorProfile.id}
        />
      </div>

      <div className="mt-auto">
        <CounsellingAppointment
          duration={duration!}
          firstName={doctorProfile.firstName!}
          professionalUserId={doctorProfile.id}
          date={selectedDateTime?.date!}
          timeSlots={selectedDateTime?.timeSlots!}
          priceInCents={selectedDateTime?.priceInCents!}
        />
      </div>
    </article>
  );
};

export default CompleteDoctorProfile;
