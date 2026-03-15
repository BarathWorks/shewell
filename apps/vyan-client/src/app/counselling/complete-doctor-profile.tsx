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
    <div className="group w-full">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/80 px-2 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 ease-in-out hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:gap-5 sm:rounded-2xl sm:px-4 sm:py-5 md:flex-col md:justify-between md:gap-6 md:rounded-3xl md:px-8 md:py-8">
        <div className="flex flex-col gap-4 sm:gap-4 md:gap-[18px]">
          {/* image + text */}
          <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-6 2xl:gap-8">
            {/* image */}
            <div className="relative flex aspect-square w-20 items-center justify-center sm:w-28 md:w-32 lg:w-40">
              <div className="absolute inset-0 h-20 w-20 rounded-full bg-gradient-to-br from-[#00898F]/20 to-[#51AF5A]/20 p-0.5 sm:h-32 sm:w-32 sm:p-1 md:h-36 md:w-36 md:p-2 lg:h-44 lg:w-44">
                <div className="relative aspect-square overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-white">
                  <Image
                    src={doctorProfile.media?.fileUrl || "/images/fallback-user-profile.png"}
                    alt="feature-card"
                    className="rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                    fill={true}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-poppins text-base font-semibold leading-tight text-[#333333] sm:text-lg md:text-xl lg:text-2xl">
                  {doctorProfile.firstName}
                </h3>
                <Link href={`counselling/${doctorProfile.userName}`} className="hover:opacity-80 transition-opacity">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#00898F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
              <div className="font-poppins text-xs font-medium text-[#00898F] sm:text-sm md:text-base">
                {doctorProfile.displayQualification?.specialization}
              </div>

              {/* Languages */}
              <div className="flex flex-wrap items-center gap-1">
                {doctorProfile.languages?.map((item, index) => (
                  <div
                    className="rounded-full border border-gray-200 bg-[#F5F5F5] px-2 py-0.5 font-poppins text-[10px] font-medium text-[#666666]"
                    key={index}
                  >
                    {item.language}
                  </div>
                ))}
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap items-center gap-1">
                {specialization &&
                  specialization.map((item, index) => (
                    <div
                      className="rounded-full border border-[#00898F]/20 bg-gradient-to-r from-[#00898F]/10 to-[#51AF5A]/10 px-2 py-0.5 font-poppins text-[10px] font-medium text-[#00898F]"
                      key={index}
                    >
                      {item.specialization}
                    </div>
                  ))}
              </div>

              <div className="mt-0.5 flex w-full flex-wrap items-center gap-2 md:justify-start">
                <div className="flex items-center gap-2 rounded-full bg-[#F8F8F8] px-2 py-0.5">
                  <Rating
                    className="inline"
                    readOnly={true}
                    style={{ maxWidth: 60 }}
                    value={parseFloat(doctorProfile.avgRating || "0")}
                    itemStyles={customStyles}
                  />
                  <div className="font-poppins text-[10px] font-semibold text-[#00898F]">
                    {parseFloat(doctorProfile.avgRating || "0").toFixed(1)}
                  </div>
                </div>
                <div className="font-poppins text-[10px] font-normal text-[#666666]">
                  • {doctorProfile?.totalConsultations || 0} Consultations
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            
           
            <DayNavigatorWithTimeSlots
              onSelectDuration={handleDuration}
              onSelectDateTime={handleDateTimeSelect}
              professionalUserId={doctorProfile.id}
            />
          </div>
        </div>
        
        <div className="md:self-center xl:self-start">
          <CounsellingAppointment
            duration={duration!}
            firstName={doctorProfile.firstName!}
            professionalUserId={doctorProfile.id}
            date={selectedDateTime?.date!}
            timeSlots={selectedDateTime?.timeSlots!}
            priceInCents={selectedDateTime?.priceInCents!}
          />
        </div>
      </div>
    </div>
  );
};

export default CompleteDoctorProfile;
