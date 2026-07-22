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
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    role: "Gynecologist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 3,
    name: "Dr. Anil Mehta",
    role: "Pediatrician",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 4,
    name: "Dr. Kavitha Rao",
    role: "Psychologist",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 5,
    name: "Dr. James Cooper",
    role: "Lactation Expert",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 6,
    name: "Dr. Rajesh Gupta",
    role: "Dermatologist",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 7,
    name: "Dr. Ananya Roy",
    role: "Obstetrician",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 8,
    name: "Dr. Vikram Malhotra",
    role: "Fertility Specialist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&h=600&q=80",
  },
  {
    id: 9,
    name: "Dr. Maya Patel",
    role: "Postnatal Care",
    image:
      "https://images.unsplash.com/photo-1594824813566-78853a81232c?auto=format&fit=crop&w=600&h=600&q=80",
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
  return (
    <div className={`relative overflow-hidden rounded-full bg-[#EBF7F7] ${sizeClass}`}>
      <img
        src="/default_doctor_avatar.svg"
        alt={name || "Expert Avatar"}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** Single expert circle — image with onError fallback */
function ExpertCircle({
  expert,
  avatarLevel,
  sizeClass,
  shadowClass,
}: {
  expert: ExpertData;
  avatarLevel: 1 | 2 | 3; // 1 = Big (Center), 2 = Medium (Inner), 3 = Small (Outer)
  sizeClass: string;
  shadowClass: string;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!expert.image && !imgError;

  // Font size & bottom position defined precisely based on radius level
  const fontStyle =
    avatarLevel === 1
      ? "text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wide"
      : avatarLevel === 2
        ? "text-[10px] sm:text-xs md:text-sm font-semibold tracking-normal text-white/95"
        : "text-[7px] sm:text-[8px] md:text-[10px] lg:text-[11px] font-medium tracking-tight text-white/90";

  const bottomPosition =
    avatarLevel === 1
      ? "bottom-3 sm:bottom-4 md:bottom-6"
      : avatarLevel === 2
        ? "bottom-2.5 sm:bottom-3.5 md:bottom-4"
        : "bottom-1.5 sm:bottom-2 md:bottom-2.5";

  return (
    <div
      className={`relative overflow-hidden rounded-full transition-all duration-300 ${sizeClass} ${shadowClass}`}
    >
      {hasImage ? (
        <img
          src={expert.image}
          alt={expert.name ?? "Expert"}
          className="h-full w-full object-cover object-center"
          onError={() => setImgError(true)}
        />
      ) : (
        <AvatarFallback name={expert.name} sizeClass="h-full w-full" />
      )}

      {/* Bottom gradient vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Role label matching reference image (• Specialist) */}
      <div
        className={`absolute ${bottomPosition} left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 w-full px-1 text-center select-none pointer-events-none z-10`}
      >
        <span
          className={`font-poppins text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap ${fontStyle}`}
        >
          • {expert.role || "Specialist"}
        </span>
      </div>
    </div>
  );
}

export default function ExpertsCarousel() {
  const { data, isLoading } = api.topExperts.getTopExperts.useQuery();

  const expertsData = useMemo<ExpertData[]>(() => {
    return (data?.topExperts ?? [])
      .filter((doctor) => doctor != null)
      .map((doctor) => ({
        id: doctor?.id ?? Math.random(),
        name:
          doctor?.firstName || doctor?.lastName
            ? `${doctor?.firstName ?? ""} ${doctor?.lastName ?? ""}`.trim()
            : undefined,
        role: doctor?.displayQualification?.specialization ?? "Specialist",
        image:
          doctor?.media?.fileUrl &&
          doctor.media.fileUrl !== "null" &&
          doctor.media.fileUrl !== "undefined" &&
          doctor.media.fileUrl !== ""
            ? doctor.media.fileUrl
            : undefined,
        userName: doctor?.userName,
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

        {/* Carousel — 5 Symmetrical Focal Avatars matching reference design */}
        <div
          className="relative flex h-[200px] items-center justify-center px-6 sm:h-[260px] sm:px-10 md:h-[350px] md:px-14 lg:h-[390px]"
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

          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.slice(0, Math.min(5, items.length)).map((expert, index) => {
                const totalItems = Math.min(5, items.length);
                const centerIndex = Math.floor(totalItems / 2);
                const distance = Math.abs(index - centerIndex);
                const isCenter = distance === 0;
                const isSide = distance === 1;

                const sizeClass = isCenter
                  ? "w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64"
                  : isSide
                    ? "w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                    : "w-18 h-18 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36";

                const shadowClass = isCenter
                  ? "shadow-[0_20px_45px_rgba(0,0,0,0.18)]"
                  : isSide
                    ? "shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
                    : "shadow-[0_6px_18px_rgba(0,0,0,0.08)] opacity-90";

                const avatarLevel = (distance === 0 ? 1 : distance === 1 ? 2 : 3) as 1 | 2 | 3;

                return (
                  <motion.div
                    key={expert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isCenter ? 1 : isSide ? 0.92 : 0.82,
                      scale: isCenter ? 1.05 : isSide ? 0.95 : 0.85,
                      zIndex: isCenter ? 30 : isSide ? 20 : 10,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 24,
                    }}
                    className="relative shrink-0"
                  >
                    <Link 
                      href={expert.userName ? `/counselling/${expert.userName}` : "/counselling"}
                      className="block cursor-pointer transition-transform hover:scale-105"
                      title={expert.name ? `Consult with ${expert.name}` : "Book consultation"}
                    >
                      <ExpertCircle
                        expert={expert}
                        avatarLevel={avatarLevel}
                        sizeClass={sizeClass}
                        shadowClass={shadowClass}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {showNavigation && (
            <button
              onClick={handleNext}
              className="absolute right-2 z-30 rounded-full border border-gray-300 bg-white p-1.5 transition-colors hover:bg-gray-100 sm:right-4 sm:p-2 md:left-auto md:right-6 md:p-3"
              aria-label="Next expert"
            >
              <ChevronRight size={18} className="text-gray-600 sm:size-5 md:size-6" />
            </button>
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14">
          <Link href="/counselling">
            <div className="group flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 rounded-[24px] bg-[#F2F2F2] p-4 h-[76px] transition-all duration-300 ease-in-out hover:bg-[#00898F] active:bg-[#006e72] sm:h-[90px] sm:p-5 md:h-[100px] md:p-6 shadow-sm hover:shadow-md">
              <div className="flex flex-1 justify-center">
                <span className="text-center font-poppins text-base font-semibold uppercase tracking-[0.15em] text-[#00000066] transition-colors duration-300 group-hover:text-white group-active:text-white sm:text-xl md:text-2xl lg:text-[28px]">
                  BOOK A SESSION WITH OUR EXPERTS
                </span>
              </div>
              <InteractiveButton as="span" size="xlarge" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
