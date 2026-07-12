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
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";
import TimeSlots from "./date-with-time-slots";
import React from "react";
import DoctorProfileContent from "./doctor-profile-content";

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

const DoctorProfile = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/login");
  }

  if(!session.user.email){
    return
  }

  console.log("emailAtServer", session.user.email)
  const profile = await db.professionalUser.findFirst({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      qualifications: {
        select: {
          degree: true,
          // displayedQualification: true,
        },
      },
      userName: true,
      avgRating: true,
      totalConsultations: true,
      aboutYou: true,
      aboutEducation: true,
      displayQualificationId: true,
      displayQualification: true,
      ProfessionalSpecializations: true,
      googleAccessToken: true,
      media: {
        select: {
          fileUrl: true,
        },
      },
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
    },
    where: {
      email: session.user.email,
    },
  });

  console.log("profileAtServer",profile,session.user.email)


  if (!profile) {
    return;
  }

  // converting the decimal avgrating to string avgrating
  // if the profile is array, then i will use map just like did in products
  const profileObj = {
    ...profile,
    firstName: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim(),
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
  const allSpecializations = await db.professionalSpecializations.findMany({
    select: {
      id: true,
      specialization: true,
    },
    where: {
      active: true,
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

  if (!profileObj) {
    return {
      message: "Profile not found ",
    };
  }

  console.log("sessionAtPage", session.user.id);

  return (
    <>
      <DoctorProfileContent
        degrees={degrees}
        professionalExperience={professionalExperience}
        profile={profileObj}
        allSpecializations={allSpecializations.map((a) => ({
          value: a.id,
          label: a.specialization,
        }))}
      />
    </>
  );
};
export default DoctorProfile;
