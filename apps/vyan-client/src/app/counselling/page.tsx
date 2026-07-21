"use client";

import CompleteDoctorProfile from "~/app/counselling/complete-doctor-profile";

import CounsellingFilter from "./counselling-filter";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import CompleteDoctorProfileSkeleton from "./complete-doctor-profile-skeleton";

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
    <>
      <div className="w-full">
        <section className="w-full overflow-hidden bg-[#F8FAFB] px-3 py-6 sm:px-4 sm:py-8 md:px-8 md:py-12 lg:px-[100px] lg:py-16">
          <div className="max-w-8xl mx-auto">
            {/* Section Header */}
            <div className="mb-6 text-center sm:mb-8 md:mb-10 lg:mb-12">
              <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 font-poppins">
                Find Your Trusted Care Partner
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-[#33333399]">
                Connect with certified specialists who understand your journey
                and provide personalized support.
              </p>
            </div>

            {/* Filter Section */}
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-14">
              <CounsellingFilter
                onSelectSpecialisation={handleSpecialisationId}
                onSelectDate={handleDate}
              />
            </div>

            {/* Doctor Profiles Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 xl:grid-cols-2">
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
              {filteredDoctors?.professionalUsers.length === 0 && (
                <div className="col-span-full w-full rounded-[24px] bg-white p-8 md:p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#E1EBED] flex items-center justify-center text-[#00898F]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-gray-900">No Specialists Found</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      No doctors currently match your selected filters. Try resetting search criteria or choosing another date.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Counselling;
