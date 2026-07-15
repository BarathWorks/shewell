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
  specialization?: {
    specialization?: string;
  }[];
  isCouple: boolean;
}

const CompleteDoctorProfile = ({
  doctorProfile,
  specialization,
  isCouple,
}: IDoctorProfileProps) => {
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Date | null;
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  } | null>(null);
  const [duration, setDuration] = useState<number>();
  const [priceInCents, setPriceInCents] = useState<number | null>(null);

  const handleDuration = (value: number) => {
    setDuration(value);
  };

  const handleDateTimeSelect = (dateTime: {
    date: Date;
    timeSlots: { startTime: Date; endTime: Date } | null;
    priceInCents: number | null;
  }) => {
    setSelectedDateTime(dateTime);
    if (dateTime.priceInCents !== null) {
      setPriceInCents(dateTime.priceInCents);
    }
  };

  useEffect(() => {
    setSelectedDateTime(null);
    setPriceInCents(null);
  }, [duration]);

  const StarDrawing = (
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  );
  
  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#006879",
    inactiveFillColor: "#c0c8cc",
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full">
      <div className="w-full max-w-[600px] mx-auto md:ml-0 md:mr-auto bg-white rounded-[24px] shadow-lg border border-[#c0c8cc]/30 p-5 md:p-6 space-y-5">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          {/* Profile Avatar */}
          <div className="relative shrink-0 w-28 h-28 md:w-32 md:h-32">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-[#F4F4F4] flex items-center justify-center shadow-sm">
              {!imgError && doctorProfile.media?.fileUrl && doctorProfile.media.fileUrl !== "null" && doctorProfile.media.fileUrl !== "undefined" && doctorProfile.media.fileUrl !== "" ? (
                <Image
                  src={doctorProfile.media.fileUrl}
                  alt="doctor-profile"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  fill={true}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="font-poppins text-3xl md:text-4xl font-bold text-[#006879] select-none">
                  {doctorProfile.firstName ? doctorProfile.firstName.replace(/^Dr\.\s*/i, "")[0]?.toUpperCase() : "D"}
                </span>
              )}
            </div>
          </div>
          
          {/* Doctor Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-poppins text-xl font-bold text-[#0b1c30] sm:text-2xl leading-none">
                {doctorProfile.firstName?.startsWith("Dr.") ? doctorProfile.firstName : `Dr. ${doctorProfile.firstName}`}
              </h1>
              <Link 
                href={`/counselling/${doctorProfile.userName}`}
                className="text-[#006879] hover:opacity-70 transition-opacity flex items-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="align-middle">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </Link>
            </div>
            
            <p className="text-[#006879] font-poppins text-base font-semibold leading-tight">
              {doctorProfile.displayQualification?.specialization}
            </p>
            
            {/* Language & Expertise Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {doctorProfile.languages?.map((item, index) => (
                <div 
                  className="bg-[#F4F4F4] px-4 py-1.5 rounded-full flex items-center"
                  key={index}
                >
                  <span className="text-[14px] font-normal text-black">{item.language}</span>
                </div>
              ))}
              
              {specialization &&
                specialization.map((item, index) => (
                  <div 
                    className="bg-[#E1EBED]/60 border border-[#00898F]/15 px-4 py-1.5 rounded-full flex items-center"
                    key={index}
                  >
                    <span className="text-[14px] font-semibold text-[#00898F]">{item.specialization}</span>
                  </div>
                ))}
            </div>
            
            {/* Rating & Consultations */}
            <div className="flex items-center gap-2 pt-1 text-gray-500 font-poppins text-xs sm:text-sm">
              <Rating
                readOnly={true}
                style={{ maxWidth: 75 }}
                value={parseFloat(doctorProfile.avgRating || "0")}
                itemStyles={customStyles}
              />
              <span className="font-bold text-[#0b1c30] text-sm">
                {parseFloat(doctorProfile.avgRating || "0").toFixed(1)}
              </span>
              <span className="text-xs">• {doctorProfile?.totalConsultations || 0} Consultations</span>
            </div>
          </div>
        </section>

        {/* Availability Section */}
        <section className="space-y-4 border-t border-[#c0c8cc]/30 pt-5">
          <DayNavigatorWithTimeSlots
            onSelectDuration={handleDuration}
            onSelectDateTime={handleDateTimeSelect}
            onPriceChange={setPriceInCents}
            professionalUserId={doctorProfile.id!}
          />
        </section>
        
        {/* Footer Action Section */}
        <footer className="border-t border-[#c0c8cc]/30 pt-5">
          <CounsellingAppointment
            duration={duration!}
            firstName={doctorProfile.firstName!}
            professionalUserId={doctorProfile.id!}
            date={selectedDateTime?.date!}
            timeSlots={selectedDateTime?.timeSlots!}
            priceInCents={priceInCents!}
          />
        </footer>
      </div>
    </div>
  );
};

export default CompleteDoctorProfile;
