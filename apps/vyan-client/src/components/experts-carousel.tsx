"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";
import Link from "next/link";
import { api } from "~/trpc/react";

const EXPERTS_DATA = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    role: "Nutritionist",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    role: "Gynecologist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 3,
    name: "Dr. Anil Mehta",
    role: "Pediatrician",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 4,
    name: "Dr. Kavitha Rao",
    role: "Psychologist",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 5,
    name: "Dr. James Cooper",
    role: "Lactation Expert",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80",
  },
];

type ExpertData = {
  id: string | number;
  name?: string;
  role: string;
  image?: string;
  userName?: string;
};

/** Initials avatar shown when no photo is available or image fails to load */
function AvatarFallback({
  name,
  sizeClass,
}: {
  name?: string;
  sizeClass: string;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#00898F]/25 to-[#114668]/25 ${sizeClass}`}
    >
      {initials ? (
        <span className="text-lg font-bold text-[#114668] sm:text-xl md:text-2xl lg:text-3xl">
          {initials}
        </span>
      ) : (
        <User className="h-6 w-6 text-[#114668]/50 sm:h-8 sm:w-8 md:h-10 md:w-10" />
      )}
    </div>
  );
}

/** Single expert circle — image with onError fallback */
function ExpertCircle({
  expert,
  isCenter,
  isSide,
}: {
  expert: ExpertData;
  isCenter: boolean;
  isSide: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!expert.image && !imgError;

  const sizeClass = isCenter
    ? "h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40"
    : "h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 lg:h-28 lg:w-28";

  return (
    <div
      className={`relative overflow-hidden rounded-full shadow-lg ${sizeClass} ${
        !isCenter ? "grayscale-[30%]" : ""
      }`}
    >
      {hasImage ? (
        <img
          src={expert.image}
          alt={expert.name ?? "Expert"}
          className="h-full w-full object-cover object-top"
          onError={() => setImgError(true)}
        />
      ) : (
        <AvatarFallback name={expert.name} sizeClass="h-full w-full" />
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Role badge inside circle at bottom */}
      <motion.div
        animate={{ opacity: isCenter ? 1 : 0.6 }}
        className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-0.5 sm:gap-1 ${
          isCenter
            ? "bottom-2 sm:bottom-4 md:bottom-6"
            : "bottom-1 sm:bottom-2 md:bottom-4"
        }`}
      >
        <span
          className={`rounded-full bg-white ${
            isCenter
              ? "h-1 w-1 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5"
              : "h-0.5 w-0.5 sm:h-0.5 sm:w-0.5 md:h-1 md:w-1"
          }`}
        />
        <span
          className={`whitespace-nowrap font-medium text-white ${
            isCenter
              ? "text-[8px] sm:text-[8px] md:text-[11px] lg:text-[12px]"
              : "text-[7px] sm:text-[7px] md:text-[9px] lg:text-[8px]"
          }`}
        >
          {expert.role}
        </span>
      </motion.div>
    </div>
  );
}

export default function ExpertsCarousel() {
  const { data, isLoading } = api.topExperts.getTopExperts.useQuery();

  const expertsData = useMemo<ExpertData[]>(() => {
    if (!data?.topExperts || data.topExperts.length === 0) {
      return EXPERTS_DATA;
    }
    return data.topExperts.map((doctor) => ({
      id: doctor.id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      role: doctor.displayQualification?.specialization ?? "Specialist",
      // undefined triggers fallback; avoids broken-image requests
      image: doctor.media?.fileUrl ?? undefined,
      userName: doctor.userName,
    }));
  }, [data]);

  const [items, setItems] = useState<ExpertData[]>(expertsData);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setItems(expertsData);
  }, [expertsData]);

  const handleNext = useCallback(() => {
    setItems((prev) => {
      const arr = [...prev];
      const first = arr.shift();
      if (first) arr.push(first);
      return arr;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setItems((prev) => {
      const arr = [...prev];
      const last = arr.pop();
      if (last) arr.unshift(last);
      return arr;
    });
  }, []);

  useEffect(() => {
    if (isHovered || items.length <= 1) return;
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [handleNext, isHovered, items.length]);

  if (!isLoading && items.length === 0) return null;

  const showNavigation = items.length > 1;

  return (
    <section className="w-full overflow-hidden bg-white px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      <div className="mx-auto">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            You're Not Alone — We're Just a Click Away
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            Consult with empathetic, qualified specialists who listen, guide,
            and support your health decisions.
          </p>
        </div>

        {/* Carousel — original overlapping scaled look */}
        <div
          className="relative flex h-[180px] items-center justify-center px-8 sm:h-[220px] sm:px-10 md:h-[320px] md:px-14 lg:h-[350px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {showNavigation && (
            <button
              onClick={handlePrev}
              className="absolute left-2 z-30 rounded-full border border-gray-300 bg-white p-1.5 transition-colors hover:bg-gray-100 sm:left-4 sm:p-2 md:left-6 md:p-3"
              aria-label="Previous expert"
            >
              <ChevronLeft size={18} className="text-gray-600 sm:size-5 md:size-6" />
            </button>
          )}

          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.slice(0, Math.min(5, items.length)).map((expert, index) => {
                const totalItems = Math.min(5, items.length);
                const centerIndex = Math.floor(totalItems / 2);
                const isCenter = index === centerIndex;
                const isSide =
                  totalItems >= 3 &&
                  (index === centerIndex - 1 || index === centerIndex + 1);

                return (
                  <motion.div
                    key={expert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isCenter ? 1 : isSide ? 0.85 : 0.7,
                      scale: isCenter ? 1.5 : isSide ? 1.4 : 1.1,
                      zIndex: isCenter ? 20 : 10,
                      marginLeft:
                        index === centerIndex
                          ? "2rem"
                          : index > centerIndex
                            ? "1rem"
                            : "0",
                      marginRight:
                        index === centerIndex
                          ? "2rem"
                          : index < centerIndex
                            ? "1rem"
                            : "0",
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                    }}
                    className="relative"
                  >
                    <ExpertCircle
                      expert={expert}
                      isCenter={isCenter}
                      isSide={isSide}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {showNavigation && (
            <button
              onClick={handleNext}
              className="absolute right-2 z-30 rounded-full border border-gray-300 bg-white p-1.5 transition-colors hover:bg-gray-100 sm:right-4 sm:p-2 md:right-6 md:p-3"
              aria-label="Next expert"
            >
              <ChevronRight size={18} className="text-gray-600 sm:size-5 md:size-6" />
            </button>
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14">
          <Link href="/counselling">
            <div className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl bg-[#F2F2F2] px-5 py-4 transition-all duration-300 ease-in-out hover:bg-[#00898F] sm:rounded-2xl sm:px-6 sm:py-5 md:px-8">
              <div className="flex flex-1 justify-center">
                <span className="text-center text-sm sm:text-base md:text-lg font-medium tracking-[0.15em] text-[#00000066] group-hover:text-white">
                  BOOK A SESSION WITH OUR EXPERTS
                </span>
              </div>
              <InteractiveButton as="span" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
