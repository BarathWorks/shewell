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
import TimeSlots from "./date-with-time-slots";
import React from "react";
import { boolean, string } from "zod";
import { useSession } from "next-auth/react";
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

  

  console.log("sessionAtDoctorProfileContent", profile);
  console.log("profileAtDoctorProfileContent", profile.media?.fileUrl);
  const cardImage = (
    <div className="w-[147px] ">
      <div className="bg- relative aspect-square ">
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
              <div className="flex justify-center gap-2 sm:justify-end sm:gap-4 flex-wrap">
                <Link href="/dashboard">
                  <Button className="w-fit rounded-lg sm:rounded-xl bg-[#00898F] px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm shadow-md transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg">
                    <svg
                      className="mr-1.5 sm:mr-2"
                      width="18"
                      height="18"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.464 14.5358C18.8857 15.9035 17.9811 17.1087 16.8293 18.0461C15.6776 18.9834 14.3138 19.6244 12.8571 19.9129C11.4005 20.2014 9.8953 20.1287 8.47323 19.7011C7.05116 19.2735 5.75548 18.5041 4.69948 17.46C3.64347 16.416 2.85929 15.1292 2.41549 13.7121C1.97169 12.295 1.88179 10.7908 2.15364 9.33094C2.42549 7.87107 3.05082 6.50002 3.97495 5.33766C4.89909 4.1753 6.0939 3.25701 7.45491 2.66309"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.1768 11.0001C20.1768 9.80625 19.9417 8.62411 19.4848 7.52115C19.028 6.41819 18.3583 5.41601 17.5142 4.57185C16.67 3.72768 15.6678 3.05804 14.5649 2.60118C13.4619 2.14432 12.2798 1.90918 11.0859 1.90918V11.0001H20.1768Z"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Check Stats
                  </Button>
                </Link>
                <Link href="/edit-profile/personal-info">
                  <Button className="w-fit rounded-lg sm:rounded-xl bg-[#00898F] px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm shadow-md transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg">
                    <svg
                      className="mr-1.5 sm:mr-2"
                      width="16"
                      height="16"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0938 18.2725H19.2756H11.0938Z"
                        fill="white"
                      />
                      <path
                        d="M11.0938 18.2725H19.2756"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.1868 3.27284C15.5484 2.91119 16.039 2.70801 16.5504 2.70801C16.8037 2.70801 17.0544 2.75789 17.2884 2.8548C17.5224 2.95172 17.735 3.09377 17.9141 3.27284C18.0931 3.45192 18.2352 3.66451 18.3321 3.89849C18.429 4.13246 18.4789 4.38323 18.4789 4.63648C18.4789 4.88973 18.429 5.1405 18.3321 5.37448C18.2352 5.60845 18.0931 5.82104 17.9141 6.00012L6.55043 17.3638L2.91406 18.2728L3.82315 14.6365L15.1868 3.27284Z"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/appointment">
                  <Button className="w-fit rounded-lg sm:rounded-xl bg-[#00898F] px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm shadow-md transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg">
                    <svg
                      className="mr-1.5 sm:mr-2"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Add your slots
                  </Button>
                </Link>
              </div>
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

                { profile.googleAccessToken === null ? (
                  <Link href="/api/google-meet-auth">
                    <div className="mt-5 flex items-center justify-center">
                      <div className="flex items-center justify-center gap-3 rounded-xl border border-[#00898F]/20 bg-[#00898F] px-4 py-3 shadow-md transition-all duration-300 hover:bg-[#007a80] hover:shadow-lg lg:px-5 lg:py-3.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 256 262"
                          >
                            <path
                              fill="#4285f4"
                              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                            />
                            <path
                              fill="#34a853"
                              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                            />
                            <path
                              fill="#fbbc05"
                              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                            />
                            <path
                              fill="#eb4335"
                              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                            />
                          </svg>
                        </div>
                        <span className="font-poppins text-sm font-medium text-white sm:text-base">
                          Add your Google account
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="mt-5 flex items-center justify-center">
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-[#00898F]/20 bg-[#F8FFFE] px-4 py-3 shadow-md lg:px-5 lg:py-3.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 256 262"
                        >
                          <path
                            fill="#4285f4"
                            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                          />
                          <path
                            fill="#34a853"
                            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                          />
                          <path
                            fill="#fbbc05"
                            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                          />
                          <path
                            fill="#eb4335"
                            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                          />
                        </svg>
                      </div>
                      <span className="font-poppins text-sm font-medium text-[#00898F] sm:text-base">
                        Google Account connected
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        className="text-[#00898F]"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 12l5 5L20 7"
                        />
                      </svg>
                    </div>
                  </div>
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
                    <TimeSlots expertId={profile.id} />
                  </div>
                  <div className="xs:w-[280px] md:min-w-[360px] md:ml-10 xl:ml-0">
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
export default DoctorProfileContent;
