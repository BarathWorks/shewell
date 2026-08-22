"use client";
import Image from "next/image";
import ProfileImageText from "../profile-image-text";
import { db } from "~/server/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";
import DoctorReview from "../doctor-reviews";
import SimilarDoctorProfileSlider from "../similar-doctor-profile-slider";
import AboutDoctor from "../about-doctor";
import { Button } from "@repo/ui/src/@/components/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { api } from "~/trpc/react";import React from "react";
import { boolean, string } from "zod";
import { useSession } from "next-auth/react";
import TimeSlots from "../date-with-time-slots";
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

const DoctorProfileContent = ({
  profile,
  professionalExperience,
  degrees,
}: IDoctorProfileContent) => {
  const session = useSession();
  const router = useRouter();
 
  if (session.status === "unauthenticated") {
    router.push("/auth/login");
  }

 

  const cardImage = (
    <div className="w-[225px] ">
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
    <div className="bg-canvas">
      <div className="container-page py-8 md:py-12">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Identity */}
          {profile && (
            <ProfileImageText
              specialization={profile.ProfessionalSpecializations}
              doctorProfile={profile}
              cardImage={cardImage}
            />
          )}

          {/* About / reviews, and availability */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="surface-card overflow-hidden p-5 sm:p-6 xl:col-span-2">
              <Tabs defaultValue="about-doctor" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2 gap-1 rounded-lg border border-hairline bg-slate-50 p-1">
                  <TabsTrigger
                    className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-xs"
                    value="about-doctor"
                  >
                    About Doctor
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-xs"
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
                <TabsContent value="reviews">
                  <DoctorReview doctorReview={profile.ratings} />
                </TabsContent>
              </Tabs>
            </div>

            <aside className="surface-card flex flex-col gap-6 p-5 sm:p-6">
              <TimeSlots expertId={profile.id} />

              <div className="relative aspect-[370/339] w-full overflow-hidden rounded-lg">
                <Image
                  src="/images/cta.png"
                  alt=""
                  fill={true}
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 380px"
                />
              </div>
            </aside>
          </div>

          {/* Similar profiles */}
          <section className="mt-2">
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              Similar doctors&apos; profiles
            </h2>
            <div className="mt-5">
              <SimilarDoctorProfileSlider
                displayQualificationId={profile.displayQualificationId!}
                similarDoctorProfileId={profile.id}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
export default DoctorProfileContent;
