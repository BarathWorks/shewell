"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarPlus, LayoutDashboard, SquarePen } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/src/@/components/tabs";

import { PageHeader, PageShell } from "~/components/ui/page";
import { buttonClass } from "~/components/ui/button-styles";

import ProfileImageText from "./profile-image-text";
import GoogleConnection from "./google-connection";
import DoctorReview from "./doctor-reviews";
import SimilarDoctorProfileSlider from "./similar-doctor-profile-slider";
import AboutDoctor from "./about-doctor";
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
 * The practitioner's own profile, as clients see it.
 *
 * The page was wrapped in `bg-[url('/images/header.png')] bg-contain
 * pt-[120px] sm:pt-[165px]` — a decorative banner image with 165px of padding
 * pushing everything below the fold — then a `md:rounded-t-[50px]` white sheet,
 * then a `bg-primary-50` band, then a white `rounded-3xl` card *inside* it. Three
 * nested surfaces to show one card. It now sits on the same canvas as every other
 * screen.
 *
 * Other changes:
 *  - Three page actions rendered as solid teal buttons with hand-drawn SVG icons,
 *    centred on mobile and right-aligned above `sm`. They are in the page header
 *    with the rest of the app's actions, and only the one that is a genuine next
 *    step ("Edit profile") carries emphasis.
 *  - The two 40-line Google blocks moved into `google-connection.tsx`.
 *  - A `/images/cta.png` marketing panel sat in the sidebar underneath the
 *    booking widget, on a page only the practitioner can see. Removed.
 *  - Six unused imports (`db` — a *server* import, in a client component — plus
 *    `getServerSession`, `redirect`, `api`, `boolean`, `string`) and two
 *    `console.log`s of the whole profile object went with it.
 */
const DoctorProfileContent = ({
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
        title="Your public profile"
        description="This is what clients see when they open your listing. Keep it current — it is the only thing they have to go on before booking."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" },
        ]}
        actions={
          <>
            <Link
              href="/dashboard"
              className={buttonClass({ variant: "ghost", size: "md" })}
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/appointment"
              className={buttonClass({ variant: "outline", size: "md" })}
            >
              <CalendarPlus aria-hidden="true" className="size-4" />
              Manage slots
            </Link>
            <Link
              href="/edit-profile/personal-info"
              className={buttonClass({ variant: "primary", size: "md" })}
            >
              <SquarePen aria-hidden="true" className="size-4" />
              Edit profile
            </Link>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-4">
        <GoogleConnection isConnected={profile.googleAccessToken !== null} />

        <ProfileImageText
          specialization={profile.ProfessionalSpecializations}
          doctorProfile={profile}
        />

        {/* Detail and booking, side by side above `xl`. */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="surface-card xl:col-span-2">
            <Tabs defaultValue="about-doctor" className="w-full">
              {/*
                The two tabs were `text-2xl`/`2xl:text-[28px]` headings that only
                indicated selection with a 2px bottom border — at that size they
                read as two page titles rather than one control.
              */}
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

        {/* Peers */}
        <section className="surface-card">
          <header className="border-b border-hairline p-5">
            <h2 className="text-base font-semibold text-ink">
              Practitioners in your field
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Other Shewell practitioners with the same displayed qualification.
            </p>
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

export default DoctorProfileContent;
