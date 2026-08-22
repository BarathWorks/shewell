"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import SectionHeader from "./section-header";

/**
 * Top experts carousel.
 *
 * Same query, same rotation mechanics (shift/unshift, 3s auto-advance, paused on
 * hover), same fallback-to-placeholder behaviour, same `/counselling`
 * destination.
 *
 * Presentation changed from five overlapping circles — scaled up to 1.5x, with a
 * tiny white role label sitting on a gradient scrim inside the portrait — to a row
 * of cards that state the specialist's name and speciality as text. Names were
 * already being fetched and were not shown anywhere; a visitor could see five
 * faces captioned "Specialist" and learn nothing.
 *
 * The five placeholder entries pointed at images.unsplash.com. The app's own
 * Content-Security-Policy allows images only from itself, S3 and Razorpay, so
 * every one of them was blocked by the browser and rendered as a broken-image
 * icon on the live home page. They now use the local placeholder that the real
 * data path already falls back to.
 */

const PLACEHOLDER_AVATAR = "/images/fallback-user-profile.png";

const EXPERTS_DATA = [
  { id: 1, role: "Specialist", image: PLACEHOLDER_AVATAR },
  { id: 2, role: "Specialist", image: PLACEHOLDER_AVATAR },
  { id: 3, role: "Specialist", image: PLACEHOLDER_AVATAR },
  { id: 4, role: "Specialist", image: PLACEHOLDER_AVATAR },
  { id: 5, role: "Specialist", image: PLACEHOLDER_AVATAR },
];

type ExpertData = {
  id: string | number;
  name?: string;
  role: string;
  image: string;
  userName?: string;
};

/** Avatar that degrades to initials rather than a broken-image icon. */
function ExpertAvatar({
  expert,
  size,
}: {
  expert: ExpertData;
  size: "lead" | "supporting";
}) {
  const [failed, setFailed] = useState(false);

  const initials =
    (expert.name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DR";

  const dimensions =
    size === "lead"
      ? "size-20 sm:size-24 md:size-28 lg:size-32"
      : "size-16 sm:size-20 md:size-24";

  if (failed || !expert.image) {
    return (
      <div
        className={`${dimensions} flex items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-lg font-semibold text-primary-700`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={expert.image}
      alt=""
      onError={() => setFailed(true)}
      className={`${dimensions} rounded-full border border-hairline bg-slate-100 object-cover`}
    />
  );
}

export default function ExpertsCarousel() {
  const { data, isLoading, error } = api.topExperts.getTopExperts.useQuery();

  const expertsData = useMemo<ExpertData[]>(() => {
    if (!data?.topExperts || data.topExperts.length === 0) {
      return EXPERTS_DATA;
    }

    return data.topExperts.map((doctor) => ({
      id: doctor.id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      role: doctor.displayQualification?.specialization ?? "Specialist",
      image: doctor.media?.fileUrl ?? PLACEHOLDER_AVATAR,
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
      const newArr = [...prev];
      const first = newArr.shift();
      if (first) newArr.push(first);
      return newArr;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setItems((prev) => {
      const newArr = [...prev];
      const last = newArr.pop();
      if (last) newArr.unshift(last);
      return newArr;
    });
  }, []);

  useEffect(() => {
    if (isHovered || items.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [handleNext, isHovered, items.length]);

  if (!isLoading && items.length === 0) {
    return null;
  }

  const showNavigation = items.length > 1;
  const visible = items.slice(0, Math.min(5, items.length));
  const centerIndex = Math.floor(visible.length / 2);

  return (
    <section className="section-y overflow-hidden bg-surface">
      <div className="container-page">
        <SectionHeader
          eyebrow="Our specialists"
          title={
            <>
              You&apos;re Not Alone —{" "}
              <span className="text-primary-600">We&apos;re Just a Click Away</span>
            </>
          }
          lead="Consult with empathetic, qualified specialists who listen, guide, and support your health decisions."
        />

        <div
          className="relative mt-10 md:mt-14"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {showNavigation && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-body shadow-sm transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              aria-label="Previous expert"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          <div className="flex items-stretch justify-center gap-3 px-12 sm:gap-4 md:gap-6 md:px-16">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((expert, index) => {
                const isCenter = index === centerIndex;

                const card = (
                  <div
                    className={[
                      "surface-card flex h-full flex-col items-center px-4 py-6 text-center transition-colors duration-200 sm:px-5",
                      isCenter
                        ? "border-primary-200 shadow-md"
                        : "hover:border-hairline-strong",
                    ].join(" ")}
                  >
                    <ExpertAvatar
                      expert={expert}
                      size={isCenter ? "lead" : "supporting"}
                    />

                    <p
                      className={[
                        "mt-4 font-semibold text-ink",
                        isCenter ? "text-base" : "text-sm",
                      ].join(" ")}
                    >
                      {expert.name ?? "Shewell Specialist"}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {expert.role}
                    </p>
                  </div>
                );

                return (
                  <motion.div
                    key={expert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{
                      opacity: isCenter ? 1 : 0.9,
                      scale: isCenter ? 1 : 0.94,
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    className={[
                      "shrink-0",
                      isCenter ? "w-44 sm:w-52" : "hidden w-40 sm:block sm:w-44",
                    ].join(" ")}
                  >
                    {expert.userName ? (
                      <Link
                        href={`/counselling/${expert.userName}`}
                        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
                      >
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {showNavigation && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-body shadow-sm transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              aria-label="Next expert"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <Link
            href="/counselling"
            className="group inline-flex h-12 items-center gap-2 rounded-lg border border-primary-600 bg-primary-600 px-6 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:border-primary-700 hover:bg-primary-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:text-base"
          >
            Book a session with our experts
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
