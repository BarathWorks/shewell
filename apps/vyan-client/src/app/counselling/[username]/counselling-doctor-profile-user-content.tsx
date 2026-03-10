"use client";
import Image from "next/image";
import ProfileImageText from "./profile-image-text";
import { db } from "~/server/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import DoctorReview from "./doctor-reviews";
import SimilarDoctorProfileSlider from "./similar-doctor-profile-slider";
import AboutDoctor from "./about-doctor";
import { Button } from "@repo/ui/src/@/components/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import React from "react";
import { boolean, string } from "zod";
import { useSession } from "next-auth/react";
import TimeSlots from "./date-with-time-slots";
interface IProfessionalSpecialisation {
  //   id: string;
  specialization: string;
  active: boolean;
  deletedAt: Date | null;
}

interface IProfessionalExperience {
  //   id: string;
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
}

interface IProfessionalDegree {
  //   id: string;
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
  console.log("profile", profile.googleAccessToken);
  // if (session.status === "unauthenticated") {
  //   router.push("/auth/login");
  // }

  console.log("sessionAtDoctorProfileContent", session);

  const cardImage = (
    <div className="w-[225px]">
      <div className="relative aspect-square ">
        <Image
          src={profile.media?.fileUrl || "/images/fallback-user-profile.png"}
          alt="feature-card"
          className=" rounded-full  object-cover"
          fill={true}
        />
      </div>
    </div>
  );
  return (
    <>
      <div className="bg-[url('/images/header.png')] bg-contain  bg-no-repeat	pt-[120px] sm:pt-[165px] ">
        <div className="bg-white  md:rounded-t-[50px]">
          <div className="container mx-auto max-w-full">
            <div className=" flex flex-col gap-6  pb-8 pt-[18px] md:gap-[30px] md:rounded-t-[50px] md:pb-9 md:pt-5 xl:gap-[32px] xl:pb-[60px] xl:pt-6 2xl:gap-[40px] 2xl:pb-[65px] 2xl:pt-8">
              {/* div-1 */}
              {/* profile-image-text-specializaion */}
              <div>
                {profile && (
                  <ProfileImageText
                    // specialization={specialization}
                    specialization={profile.ProfessionalSpecializations}
                    doctorProfile={profile}
                    cardImage={cardImage}
                  />
                )}
              </div>
              {/* div-2 */}
              {/* about-doctor and reviews and available time slots */}
              <div className="flex flex-col gap-[30px] xl:flex-row 2xl:gap-[45px] ">
                {/* about-doctor and reviews */}
                <div className="bg-[#F7FBFC] py-6 md:py-8 xl:basis-[856px] 2xl:basis-[1109px] 2xl:py-10">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-8">
                    <Tabs defaultValue="about-doctor" className="w-full">
                      <TabsList className="mb-[18px] grid w-full grid-cols-2 md:px-4 2xl:px-8">
                        <TabsTrigger
                          className="border-b-primary font-inter text-base font-semibold text-active data-[state=active]:border-b-2 md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px] "
                          value="about-doctor"
                        >
                          About Doctor
                        </TabsTrigger>
                        <TabsTrigger
                          className="border-b-primary font-inter text-base font-semibold text-active data-[state=active]:border-b-2 md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]"
                          value="reviews"
                        >
                          Reviews
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="about-doctor">
                        <AboutDoctor
                          aboutEducation={profile?.aboutEducation!}
                          aboutYou={profile?.aboutYou!}
                          degrees={degrees}
                          experience={professionalExperience}
                        />
                      </TabsContent>
                      <TabsContent className="" value="reviews">
                        <DoctorReview doctorReview={profile.ratings} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                {/* available time slots */}
                <div
                  className="flex flex-col gap-5 bg-[#F7FBFC] py-6 md:flex-row md:justify-between md:py-8 xl:basis-[394px] xl:flex-col xl:px-3 2xl:basis-[565px] 2xl:px-6 2xl:py-10
                  "
                >
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:p-8">
                    <TimeSlots professionalUserId={profile.id} />
                  </div>
                  <div className="xs:w-[280px] md:ml-10 md:min-w-[360px] xl:ml-0">
                    <div className="relative aspect-[370/339] w-full">
                      <Image
                        src="/images/cta.png"
                        alt=""
                        fill={true}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* div-3 */}
              {/* Similar-Doctor-Profies */}
              <div>
                <div className="mb-[18px] font-poppins text-[20px] font-bold leading-8 sm:text-[22px] md:mb-5 md:text-[30px] md:leading-[48px] xl:mb-6 xl:text-[36px] 2xl:text-[40px] 2xl:leading-[52px]">
                  Similar doctor's profiles
                </div>
                <SimilarDoctorProfileSlider
                  displayQualificationId={profile.displayQualificationId!}
                  similarDoctorProfileId={profile.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default CounsellingDoctorProfileContent;
