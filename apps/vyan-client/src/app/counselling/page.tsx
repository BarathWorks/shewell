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
              <h2 className="mb-2 font-poppins text-base font-medium leading-tight text-[#333333] sm:mb-3 sm:text-lg md:mb-4 md:text-2xl lg:text-4xl xl:text-5xl">
                Find Your Trusted Care Partner
              </h2>
              <p className="mx-auto px-2 text-[10px] text-[#33333399] sm:px-3 sm:text-xs md:px-4 md:text-sm lg:px-6 lg:text-base xl:text-lg">
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
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:grid-cols-2 xl:gap-8">
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
                <div>No Doctors Found</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Counselling;
