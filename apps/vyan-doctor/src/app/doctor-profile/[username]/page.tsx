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
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";
import TimeSlots from "../date-with-time-slots";
import React from "react";
import DoctorProfileContent from "../doctor-profile-content";
import DoctorProfileContentUsername from "./doctor-profile-content-username";

interface IDoctorProfileProps {
  doctorProfile: {
    firstName: string;
    qualifications: {
      displayedQualification: string;
    }[];
    avgRating: string;
    totalConsultations: string;
  };
  cardImage: React.ReactNode;
}

const DoctorProfile = async ({ params }: { params: { username: string } }) => {
  //   const session = await getServerSession();
  // console.log("bhu", session?.user.email);
  // const {data} = session

  const profile = await db.professionalUser.findFirst({
    select: {
      id: true,
      firstName: true,
      qualifications: {
        select: {
          degree: true,
          // displayedQualification: true,
        },
      },
      avgRating: true,
      totalConsultations: true,
      userName: true,
      aboutYou: true,
      aboutEducation: true,
      displayQualificationId: true,
      displayQualification: true,
      ProfessionalSpecializations: true,

      ratings: {
        select: {
          id: true,
          review: true,
          rating: true,
          bookAppointment: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          createdAt: true,
        },
      },
      createdAt: true,
      media: {
        select: {
          fileUrl: true,
        },
      },
    },
    where: {
      userName: params.username,
    },
  });

  console.log("doctor profile for user name", profile, params.username)

  if (!profile) {
    redirect("/");
  }

  // converting the decimal avgrating to string avgrating
  // if the profile is array, then i will use map just like did in products
  const profileObj = {
    ...profile,
    avgRating: profile?.avgRating?.toString() || "",
    displayQualification: profile.displayQualification?.specialization,
  };

  const professionalExperience = await db.professionalExperience.findMany({
    where: {
      professionalUserId: profile?.id,
    },
    select: {
      position: true,
      department: true,
      location: true,
      startingYear: true,
      endingYear: true,
    },
  });
  // console.log("professionalExperience", professionalExperience);
  const specialization = await db.professionalSpecializations.findMany({
    select: {
      specialization: true,
    },
  });

  const degrees = await db.professionalDegree.findMany({
    where: {
      professionalUserId: profile?.id,
    },
    select: {
      degree: true,
    },
  });

  // const doctorReview = [
  //   {
  //     rating: 4,
  //     approved: true,
  //     review:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
  //     //   createdAt: 14 / 9 / 23,
  //   },
  //   {
  //     rating: 4,
  //     approved: true,
  //     review:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
  //     //   createdAt: 14 / 9 / 23,
  //   },
  //   {
  //     rating: 4,
  //     approved: true,
  //     review:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
  //     //   createdAt: 14 / 9 / 23,
  //   },
  // ];

  // const doctor = [
  //   {
  //     doctorProfile: {
  //       firstName: "Smith",
  //       qualifications: [{ displayedQualification: "mbbs" }],
  //       avgRating: "4",
  //       totalConsultations: "372",
  //     },
  //     cardImage: (
  //       <div className="w-[100px]">
  //         <div className="relative aspect-square w-full">
  //           <Image
  //             src={"/images/women-wellness.png"}
  //             alt="feature-card"
  //             className="object-cover"
  //             fill={true}
  //           />
  //         </div>
  //       </div>
  //     ),
  //     specialization: [
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //     ],
  //   },
  //   {
  //     doctorProfile: {
  //       firstName: "Smith",
  //       qualifications: [{ displayedQualification: "mbbs" }],
  //       avgRating: "4",
  //       totalConsultations: "372",
  //     },
  //     cardImage: (
  //       <div className="w-[100px]">
  //         <div className="relative aspect-square w-full">
  //           <Image
  //             src={"/images/women-wellness.png"}
  //             alt="feature-card"
  //             className="object-cover"
  //             fill={true}
  //           />
  //         </div>
  //       </div>
  //     ),
  //     specialization: [
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //       { specialization: "jskjdl" },
  //     ],
  //   },
  // ];
  if (!profileObj) {
    return {
      message: "Profile not found ",
    };
  }
  // const { data } = api.similarDoctorProfile.similarDoctorProfile.useQuery({
  //   displayQualificationId: profile.displayQualificationId!,
  // });
  // console.log(data);

  // console.log(data);
  const cardImage = (
    <div className="w-[225px]">
      <div className=" relative aspect-square ">
        <Image
          src={profileObj.media?.fileUrl || "/images/fallback-user-profile.png"}
          alt="feature-card"
          className=" rounded-full  object-cover"
          fill={true}
        />
      </div>
    </div>
  );
  return (
    <>
      <DoctorProfileContentUsername
        degrees={degrees}
        profile={profileObj}
        professionalExperience={professionalExperience}
      />
    </>
  );
};
export default DoctorProfile;
