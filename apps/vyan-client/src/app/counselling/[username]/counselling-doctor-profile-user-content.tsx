"use client";
import Image from "next/image";
import ProfileImageText from "./profile-image-text";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import DoctorReview from "./doctor-reviews";
import SimilarDoctorProfileSlider from "./similar-doctor-profile-slider";
import AboutDoctor from "./about-doctor";
import { useRouter } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import TimeSlots from "./date-with-time-slots";

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
  const session = useSession();
  const router = useRouter();

  const cardImage = (
    <div className="relative h-full w-full">
      <Image
        src={profile.media?.fileUrl || "/images/fallback-user-profile.png"}
        alt={`Dr. ${profile.firstName || "Doctor"} profile photo`}
        className="rounded-full object-cover"
        fill={true}
      />
    </div>
  );

  return (
    <>
      {/* Page background */}
      <div className="min-h-screen bg-[#F5F7FA] px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-10 xl:py-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 md:gap-6 xl:gap-7">

            {/* ── Card 1: Profile Header ── */}
            <div className="rounded-2xl bg-white px-5 py-6 shadow-sm ring-1 ring-gray-100 sm:px-6 md:px-8 md:py-7 xl:px-10 xl:py-8">
              {profile && (
                <ProfileImageText
                  specialization={profile.ProfessionalSpecializations}
                  doctorProfile={profile}
                  cardImage={cardImage}
                />
              )}
            </div>

            {/* ── Card grid: About/Reviews + Time Slots ── */}
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-6 2xl:gap-7">

              {/* Left: About + Reviews tabs */}
              <div className="min-w-0 flex-1 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <Tabs defaultValue="about-doctor" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-t-2xl border-b border-gray-100 bg-gray-50/80 px-4 py-0 md:px-6">
                    <TabsTrigger
                      className="rounded-none border-b-2 border-transparent py-4 font-inter text-base font-semibold text-gray-500 transition-colors data-[state=active]:border-[#00898F] data-[state=active]:text-[#00898F] md:text-lg xl:text-xl"
                      value="about-doctor"
                    >
                      About Doctor
                    </TabsTrigger>
                    <TabsTrigger
                      className="rounded-none border-b-2 border-transparent py-4 font-inter text-base font-semibold text-gray-500 transition-colors data-[state=active]:border-[#00898F] data-[state=active]:text-[#00898F] md:text-lg xl:text-xl"
                      value="reviews"
                    >
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="about-doctor" className="px-5 py-6 sm:px-6 md:px-8 md:py-7 xl:px-10 xl:py-8">
                    <AboutDoctor
                      aboutEducation={profile?.aboutEducation!}
                      aboutYou={profile?.aboutYou!}
                      degrees={degrees}
                      experience={professionalExperience}
                    />
                  </TabsContent>

                  <TabsContent value="reviews" className="px-5 py-6 sm:px-6 md:px-8 md:py-7 xl:px-10 xl:py-8">
                    <DoctorReview doctorReview={profile.ratings} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right: Time Slots + CTA */}
              <div className="flex w-full flex-col gap-5 xl:w-[380px] xl:shrink-0 2xl:w-[440px]">
                {/* Time Slots Card */}
                <div className="rounded-2xl bg-white px-5 py-6 shadow-sm ring-1 ring-gray-100 sm:px-6 md:px-7 md:py-7">
                  <TimeSlots professionalUserId={profile.id} />
                </div>

                {/* CTA Image Card */}
                <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-100">
                  <div className="relative aspect-[370/339] w-full">
                    <Image
                      src="/images/cta.png"
                      alt="Book a consultation"
                      fill={true}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 3: Similar Profiles ── */}
            <div className="rounded-2xl bg-white px-5 py-6 shadow-sm ring-1 ring-gray-100 sm:px-6 md:px-8 md:py-7 xl:px-10 xl:py-8">
              <h2 className="mb-5 font-poppins text-xl font-bold text-[#1A1A2E] sm:text-2xl md:mb-6 md:text-[28px] xl:text-[32px]">
                Similar doctor&apos;s profiles
              </h2>
              <SimilarDoctorProfileSlider
                displayQualificationId={profile.displayQualificationId!}
                similarDoctorProfileId={profile.id}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
export default CounsellingDoctorProfileContent;
