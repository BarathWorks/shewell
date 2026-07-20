"use client";
import Image from "next/image";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import DoctorReview from "./doctor-reviews";
import SimilarDoctorProfileSlider from "./similar-doctor-profile-slider";
import TimeSlots from "./date-with-time-slots";
import React from "react";
import { differenceInMonths, differenceInYears } from "date-fns";

interface IProfessionalSpecialisation {
  specialization: string;
  active: boolean;
  deletedAt: Date | null;
}

interface IProfessionalExperience {
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
}

interface IProfessionalDegree {
  degree: string;
}

interface IProfile {
  id: string;
  firstName: string | null;
  createdAt: Date;
  qualifications: {
    degree: string[];
  }[];
  userName: string | null;
  avgRating: string | null;
  totalConsultations: number | null;
  aboutYou: string | null;
  aboutEducation: string | null;
  displayQualificationId: string | null;
  displayQualification: string | undefined;
  ProfessionalSpecializations: IProfessionalSpecialisation[];
  googleAccessToken?: string | null;
  media: {
    fileUrl: string | null;
  } | null;
  ratings: {
    id: string;
    review: string;
    rating: number;
    createdAt: Date;
    bookAppointment: {
      user: {
        name: string;
      };
    };
  }[];
}

interface IDoctorProfileContent {
  profile: IProfile;
  professionalExperience: IProfessionalExperience[];
  degrees: IProfessionalDegree[];
}

const CounsellingDoctorProfileContent = ({
  profile,
  professionalExperience,
  degrees,
}: IDoctorProfileContent) => {

  const StarDrawing = (
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  );
  const starCustomStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#006879",
    inactiveFillColor: "#c0c8cc",
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-12 xl:py-10 text-[#0b1c30]">
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* ── Page Header Row (Session Page / Complete Profile Theme) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[#00898F]">
              Doctor Profile
            </h1>
            <p className="font-inter text-sm text-gray-500 mt-1">
              Comprehensive clinical profile, qualifications, and patient reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#E1EBED]/60 border border-[#00898F]/15 px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00898F] animate-pulse"></div>
              <span className="text-sm font-semibold text-[#00898F]">Verified Specialist</span>
            </div>
          </div>
        </div>

        {/* ── 12-Column Main Form Grid (Session & Doctor Card Layout) ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* ── LEFT COLUMN (4 Cols ~33%): Personal Summary & Bio ── */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6 flex flex-col items-center">
              {/* Profile Avatar (Matching CompleteDoctorProfile Avatar Ring) */}
              <div className="relative mb-5 w-32 h-32">
                <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-[#F4F4F4] flex items-center justify-center shadow-sm">
                  {profile.media?.fileUrl && profile.media.fileUrl !== "null" && profile.media.fileUrl !== "" ? (
                    <Image
                      src={profile.media.fileUrl}
                      alt={profile.firstName || "Doctor"}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded-full transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <span className="font-poppins text-4xl font-bold text-[#006879]">
                      {profile.firstName ? profile.firstName.replace(/^Dr\.\s*/i, "")[0]?.toUpperCase() : "D"}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Input Style Details */}
              <div className="w-full space-y-4">
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                    FULL NAME
                  </label>
                  <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-3 font-poppins text-sm font-semibold text-[#0b1c30]">
                    Dr. {profile.firstName || "Doctor"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                    DISPLAY QUALIFICATION
                  </label>
                  <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-3 font-poppins text-sm font-medium text-[#006879]">
                    {profile.displayQualification || "Medical Specialist"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                    CLINICAL EXPERIENCE
                  </label>
                  <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-3 font-inter text-sm font-medium text-gray-700">
                    Active for {differenceInYears(new Date(), profile.createdAt)} years {differenceInMonths(new Date(), profile.createdAt) % 12} months
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                    PATIENT RATING &amp; CONSULTATIONS
                  </label>
                  <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-3 font-inter text-sm font-medium text-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Rating
                        readOnly={true}
                        style={{ maxWidth: 75 }}
                        value={parseFloat(profile.avgRating || "0")}
                        itemStyles={starCustomStyles}
                      />
                      <span className="font-bold text-[#0b1c30]">
                        {parseFloat(profile.avgRating || "0").toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      • {profile.totalConsultations || 0} Consultations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Academic Background Card */}
            <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-2">
                  PROFESSIONAL BIOGRAPHY
                </label>
                <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-3.5 font-inter text-sm leading-relaxed text-gray-700 min-h-[110px]">
                  {profile.aboutYou || "No biography provided."}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-2">
                  ACADEMIC BACKGROUND
                </label>
                <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-3.5 font-inter text-sm leading-relaxed text-gray-700 min-h-[110px]">
                  {profile.aboutEducation || "No academic details provided."}
                </div>
              </div>
            </div>

          </div>


          {/* ── RIGHT COLUMN (8 Cols ~66%): Credentials, Experience, Specializations & Booking ── */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Education & Credentials Card */}
            <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6">
              <h3 className="font-poppins text-lg font-bold text-[#0b1c30] mb-4">
                Education &amp; Credentials
              </h3>
              <div className="space-y-3">
                {degrees && degrees.length > 0 ? (
                  degrees.map((degreeItem, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-4 font-inter text-sm font-semibold text-[#0b1c30]"
                    >
                      {degreeItem.degree}
                    </div>
                  ))
                ) : (
                  <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-4 text-sm text-gray-500">
                    No degrees listed.
                  </div>
                )}
              </div>
            </div>

            {/* Work Experience Card */}
            <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6">
              <h3 className="font-poppins text-lg font-bold text-[#0b1c30] mb-4">
                Work Experience
              </h3>
              <div className="space-y-4">
                {professionalExperience && professionalExperience.length > 0 ? (
                  professionalExperience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center border-b border-[#c0c8cc]/30 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
                          YEARS (START - END)
                        </label>
                        <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl py-2.5 px-3 text-center font-inter text-xs font-semibold text-[#0b1c30]">
                          {exp.startingYear} - {exp.endingYear || "Present"}
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
                          POSITION / TITLE
                        </label>
                        <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl py-2.5 px-3 font-inter text-xs font-semibold text-[#0b1c30]">
                          {exp.position}
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
                          DEPARTMENT
                        </label>
                        <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl py-2.5 px-3 font-inter text-xs font-medium text-gray-700">
                          {exp.department}
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
                          LOCATION
                        </label>
                        <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl py-2.5 px-3 font-inter text-xs font-medium text-gray-700">
                          {exp.location}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full bg-[#F4F4F4] border border-gray-100 rounded-xl p-4 text-sm text-gray-500">
                    No work experience listed.
                  </div>
                )}
              </div>
            </div>

            {/* Specializations & Services Card */}
            {profile.ProfessionalSpecializations && profile.ProfessionalSpecializations.length > 0 && (
              <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6">
                <h3 className="font-poppins text-lg font-bold text-[#0b1c30] mb-4">
                  Specializations &amp; Services
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {profile.ProfessionalSpecializations.map((spec, index) => (
                    <div
                      key={index}
                      className="bg-[#E1EBED]/60 border border-[#00898F]/15 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#00898F]"></span>
                      <span className="text-sm font-semibold text-[#00898F]">{spec.specialization}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Time Slots Card */}
            <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6">
              <h3 className="font-poppins text-lg font-bold text-[#0b1c30] mb-4">
                Available Time Slots
              </h3>
              <TimeSlots professionalUserId={profile.id} />
            </div>

          </div>

        </div>

        {/* ── FULL WIDTH CARD: Patient Reviews & Ratings ── */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6 mt-6">
          <h3 className="font-poppins text-xl sm:text-2xl font-bold text-[#0b1c30] mb-5 pb-3 border-b border-[#c0c8cc]/30">
            Patient Reviews &amp; Ratings
          </h3>
          <DoctorReview doctorReview={profile.ratings} />
        </div>

        {/* ── FULL WIDTH CARD: Similar Doctor Profiles Slider ── */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#c0c8cc]/30 p-5 md:p-6 mt-6">
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-[#0b1c30] mb-5">
            Similar doctor&apos;s profiles
          </h2>
          <SimilarDoctorProfileSlider
            displayQualificationId={profile.displayQualificationId!}
            similarDoctorProfileId={profile.id}
          />
        </div>

      </div>
    </div>
  );
};

export default CounsellingDoctorProfileContent;
