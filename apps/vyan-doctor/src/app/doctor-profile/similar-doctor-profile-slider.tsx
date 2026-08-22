"use client";

import React from "react";
import { Users } from "lucide-react";

import { api } from "~/trpc/react";
import { EmptyState } from "~/components/ui/page";
import SimilarDoctorProfileCard from "./similar-doctor-profile-card";
import SimilarDoctorCardSkeleton from "./similar-doctor-card-skeleton";

/**
 * Practitioners with the same displayed qualification.
 *
 * This was a Swiper carousel, and it was broken: every `<SwiperSlide>` was
 * wrapped in a plain `<div className="border-red flex w-full flex-row border">`.
 * Swiper requires slides to be direct children of `<Swiper>` — with a `<div>` in
 * between it cannot register them, so the carousel had no working slides, no
 * pagination and no navigation, while still shipping three Swiper stylesheets and
 * the library itself. (`border-red` is also not a Tailwind class, so the wrapper
 * drew a 1px border in the browser default colour around each card.)
 *
 * It is a responsive grid now. That is not just the easy fix — for a short list
 * of peers it is the better control: everything is visible without interaction,
 * it reflows properly on a phone, and it needs no keyboard handling of its own.
 * The skeleton row also rendered *inside* `<Swiper>` in another stray `<div>`,
 * so the loading state had the same problem; it now fills the same grid.
 *
 * Also removed: a `console.log(data)` of every peer practitioner's profile, and
 * an `IDoctorProfileProps` interface declared at the top of the file and never
 * used (its `professionalUserAppointmentPrices` was typed as an empty object).
 */
const SimilarDoctorProfileSlider = ({
  displayQualificationId,
  similarDoctorProfileId,
}: {
  displayQualificationId: string;
  similarDoctorProfileId: string;
}) => {
  const { data, isLoading } =
    api.similarDoctorProfile.similarDoctorProfile.useQuery({
      displayQualificationId,
      similarDoctorProfileId,
    });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <SimilarDoctorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const profiles = data?.similarDoctorProfiles ?? [];

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No one else in this field yet"
        description="When other practitioners join with the same displayed qualification, they will appear here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {profiles.map((item) => {
        // A practitioner's first fully-populated specialisation stands in for the
        // qualification line on the card.
        const firstSpecialization = item.ProfessionalSpecializations?.find(
          (spec) => spec.id && spec.specialization,
        );

        const displayQualification =
          firstSpecialization?.id && firstSpecialization?.specialization
            ? {
                id: firstSpecialization.id,
                specialization: firstSpecialization.specialization,
              }
            : null;

        const specializations = (item.ProfessionalSpecializations ?? [])
          .filter(
            (spec): spec is { specialization: string } & typeof spec =>
              typeof spec.specialization === "string",
          )
          .map((spec) => ({ specialization: spec.specialization }));

        return (
          <SimilarDoctorProfileCard
            // Keyed by the practitioner rather than by array index, so a
            // re-ordered result set does not shuffle card state.
            key={item.userName ?? item.firstName}
            doctorProfile={{
              firstName: item.firstName,
              displayQualification,
              avgRating: item.avgRating?.toString(),
              totalConsultations: item.totalConsultations,
              languages: item.languages ?? [],
              professionalUserAppointmentPrices:
                item.professionalUserAppointmentPrices ?? null,
              userName: item.userName,
              media: item.media ?? null,
            }}
            specialization={specializations}
          />
        );
      })}
    </div>
  );
};

export default SimilarDoctorProfileSlider;
