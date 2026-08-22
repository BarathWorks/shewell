"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";

import { PageHeader, PageShell } from "~/components/ui/page";

import ProfileImageText from "../profile-image-text";
import DoctorReview from "../doctor-reviews";
import SimilarDoctorProfileSlider from "../similar-doctor-profile-slider";
import AboutDoctor from "../about-doctor";
import TimeSlots from "../date-with-time-slots";

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
  qualifications: { degree: string[] }[];
  userName: string | null;
  avgRating: string | null;
  totalConsultations: number | null;
  aboutYou: string | null;
  aboutEducation: string | null;
  displayQualificationId: string | null;
  displayQualification: string | undefined;
  ProfessionalSpecializations: IProfessionalSpecialisation[];
  googleAccessToken?: string | null;
  media: { fileUrl: string | null } | null;
  ratings: {
    id: string;
    review: string;
    rating: number;
    createdAt: Date;
    bookAppointment: { user: { name: string } };
  }[];
}

interface IDoctorProfileContent {
  profile: IProfile;
  professionalExperience: IProfessionalExperience[];
  degrees: IProfessionalDegree[];
}

/**
 * Another practitioner's profile, reached from the header search.
 *
 * This was a copy of the practitioner's own profile page with the edit controls
 * commented out rather than removed — around 90 lines of dead JSX including two
 * full button markups, plus a commented-out block of server-side Prisma queries
 * left inside a client component. All of it is gone, and what remains matches the
 * own-profile screen so the two do not drift apart again.
 *
 * The one genuine difference is preserved and made explicit: there are no
 * actions, because none of them apply to someone else's profile.
 */
const DoctorProfileContentUsername = ({
  profile,
  professionalExperience,
  degrees,
}: IDoctorProfileContent) => {
  const session = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (session.status === "unauthenticated") router.replace("/auth/login");
  }, [session.status, router]);

  return (
    <PageShell>
      <PageHeader
        title={`Dr. ${profile.firstName ?? ""}`.trim()}
        description="A fellow Shewell practitioner. This is the profile their clients see."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Practitioners" },
          { label: profile.firstName ?? "Profile" },
        ]}
      />

      <div className="mt-6 flex flex-col gap-4">
        <ProfileImageText
          specialization={profile.ProfessionalSpecializations}
          doctorProfile={profile}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="surface-card xl:col-span-2">
            <Tabs defaultValue="about-doctor" className="w-full">
              <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-hairline bg-transparent p-0 px-5">
                <TabsTrigger
                  value="about-doctor"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-3.5 text-sm font-medium text-muted shadow-none transition-colors duration-200 hover:text-ink data-[state=active]:border-primary-600 data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-3.5 text-sm font-medium text-muted shadow-none transition-colors duration-200 hover:text-ink data-[state=active]:border-primary-600 data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none"
                >
                  Reviews
                  {profile.ratings.length > 0 ? (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-semibold tabular text-body">
                      {profile.ratings.length}
                    </span>
                  ) : null}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about-doctor" className="mt-0 p-5">
                <AboutDoctor
                  aboutEducation={profile.aboutEducation!}
                  aboutYou={profile.aboutYou!}
                  degrees={degrees}
                  experience={professionalExperience}
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 p-5">
                <DoctorReview doctorReview={profile.ratings} />
              </TabsContent>
            </Tabs>
          </section>

          <section className="surface-card p-5">
            <TimeSlots expertId={profile.id} />
          </section>
        </div>

        <section className="surface-card">
          <header className="border-b border-hairline p-5">
            <h2 className="text-base font-semibold text-ink">
              Practitioners in the same field
            </h2>
          </header>

          <div className="p-5">
            <SimilarDoctorProfileSlider
              displayQualificationId={profile.displayQualificationId!}
              similarDoctorProfileId={profile.id}
            />
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default DoctorProfileContentUsername;
