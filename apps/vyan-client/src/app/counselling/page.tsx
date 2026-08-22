"use client";

import CompleteDoctorProfile from "~/app/counselling/complete-doctor-profile";

import CounsellingFilter from "./counselling-filter";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import CompleteDoctorProfileSkeleton from "./complete-doctor-profile-skeleton";

// Rendered per request, not prerendered at build time.
//
// This page reads from the database. It used to be forced dynamic as a side effect
// of a stray `"use server"` directive at the top of the file; with that removed —
// it was making the page component a callable endpoint — the intent has to be
// stated directly, or the build tries to prerender it and needs a live database at
// compile time.
export const dynamic = "force-dynamic";


const Counselling = () => {
  function toUTCDate(date: Date) {
    return new Date(
      Date.UTC(date?.getFullYear(), date?.getMonth(), date?.getDate()),
    );
  }

  const searchParams = useSearchParams();
  const specialisationId = searchParams.get("specialisationId");
  const selectedDate = searchParams.get("selectedDate");
  const languageId = searchParams.get("languageId");
  const time = searchParams.get("time");
  const inputSearch = searchParams.get("therapistSearch");

  const formattedLanguageIds: string[] =
    typeof languageId === "string" ? languageId.split(",") : [];

  // Only parse date when it's actually set — avoids new Date(null!) = Jan 1 1970
  const parsedDate =
    selectedDate ? toUTCDate(new Date(selectedDate)) : undefined;

  const {
    data: filteredDoctors,
    isLoading,
  } = api.findDoctor.findDoctor.useQuery({
    specialisationId: specialisationId ?? undefined,
    date: parsedDate,
    languageIds: formattedLanguageIds,
    time: time,
    inputSearch: inputSearch,
  });
  // No manual refetch needed — tRPC auto-refetches when query inputs change

  const handleSpecialisationId = (value: string) => {
    // setSpecialisationId(value);
  };
  const handleDate = (value: Date) => {
    // setDate(value);
  };

  return (
    <div className="bg-canvas">
      {/* Page header */}
      <div className="border-b border-hairline bg-surface">
        <div className="container-page py-12 text-center md:py-16">
          <p className="eyebrow">Consultations</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
            Find Your Trusted Care Partner
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
            Connect with certified specialists who understand your journey and
            provide personalized support.
          </p>
        </div>
      </div>

      <div className="container-page py-8 md:py-12">
        {/* Filters */}
        <CounsellingFilter
          onSelectSpecialisation={handleSpecialisationId}
          onSelectDate={handleDate}
        />

        {/* Results */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 xl:grid-cols-2 xl:gap-6">
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <CompleteDoctorProfileSkeleton key={index} />
            ))}
          {filteredDoctors &&
            filteredDoctors?.professionalUsers.map((item, index) => {
              const updatedItem = {
                ...item,
                avgRating: item.avgRating?.toString(),
              };

              return (
                <CompleteDoctorProfile
                  isCouple={false}
                  key={index}
                  doctorProfile={updatedItem}
                  specialization={item.ProfessionalSpecializations}
                />
              );
            })}
        </div>

        {/* Empty state. Previously a bare `<div>No Doctors Found</div>` sitting
            inside the results grid, so it rendered as a single unstyled line in
            the first column. */}
        {filteredDoctors?.professionalUsers.length === 0 && (
          <div className="surface-card mx-auto mt-8 flex max-w-xl flex-col items-center px-6 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <SearchX aria-hidden="true" className="size-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-ink">
              No specialists found
            </h2>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-body">
              No one matches these filters right now. Try widening your
              speciality, language or date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Counselling;
