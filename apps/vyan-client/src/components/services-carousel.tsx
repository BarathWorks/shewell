"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import PregnancyStages from "./pregnancy-stages";

const COURSES_DATA = [
  {
    id: 1,
    category: "Women’s health",
    mainImage: "/home/Women’s-health.webp",
    services: [
      { label: "Diet", position: "md:top-[25%] md:left-[20%] lg:top-[25%] lg:left-[20%]" },
      { label: "PCOS", position: "md:top-[25%] md:right-[20%] lg:top-[25%] lg:right-[20%]" },
      { label: "Emotional wellbeing", position: "md:bottom-[10%] md:left-[15%] lg:bottom-[10%] lg:left-[15%]" },
      { label: "Wellness", position: "md:bottom-[10%] md:right-[15%] lg:bottom-[10%] lg:right-[15%]" },
    ],
  },
  {
    id: 2,
    category: "Pregency Planning",
    mainImage: "/home/Pregnancy-Planning.webp",
    services: [
      { label: "Fertility diet", position: "md:top-[25%] md:left-[20%] lg:top-[25%] lg:left-[20%]" },
      { label: "Fertility couple mindset", position: "md:top-[25%] md:right-[20%] lg:top-[25%] lg:right-[20%]" },
      { label: "Fertility fitness", position: "md:bottom-[10%] md:left-[20%] lg:bottom-[10%] lg:left-[20%]" },
    ],
  },
  {
    id: 3,
    category: "Prenatal Care",
    mainImage: "/home/Prenatal Care.webp",
    services: [
      { label: "Pregnancy Nutrition", position: "md:top-[32%] md:left-[15%] lg:top-[32%] lg:left-[15%]" },
      { label: "Garbh Sanskar", position: "md:top-[15%] md:right-[20%] lg:top-[15%] lg:right-[20%]" },
      { label: "Childbirth education", position: "md:bottom-[13%] md:left-[17%] lg:bottom-[13%] lg:left-[17%]" },
      { label: "Emotional wellbeing", position: "md:bottom-[05%] md:right-[15%] lg:bottom-[05%] lg:right-[15%]" },
      { label: "Pregnancy Selfcare", position: "md:bottom-[38%] md:right-[12%] lg:bottom-[38%] lg:right-[12%]" },
    ],
  },
  {
    id: 4,
    category: "Postnatal Care",
    mainImage: "/home/service-postnatal.webp",
    services: [
      { label: "Lactational counselling", position: "md:top-[25%] md:left-[20%] lg:top-[25%] lg:left-[20%]" },
      { label: "Postnatal Diet", position: "md:top-[25%] md:right-[20%] lg:top-[25%] lg:right-[20%]" },
      { label: "Postpartum depression", position: "md:bottom-[10%] md:left-[20%] lg:bottom-[10%] lg:left-[20%]" },
      { label: "Moms fitness", position: "md:bottom-[20%] md:right-[20%] lg:bottom-[20%] lg:right-[20%]" },
    ],
  },

  {
    id: 5,
    category: "Child Healthcare",
    mainImage: "/home/service-child.webp",
    services: [
      { label: "Child psychology", position: "md:top-[25%] md:left-[15%] lg:top-[25%] lg:left-[15%]" },
      { label: "Child nutrition", position: "md:top-[25%] md:right-[15%] lg:top-[25%] lg:right-[15%]" },
      {
        label: "Speech language therapy",
        position: "md:top-[60%] md:left-[40%] lg:top-[60%] lg:left-[40%]",
      },
      { label: "Occupational therapy", position: "md:bottom-[10%] md:right-[10%] lg:bottom-[5%] lg:right-[10%]" },
      { label: "Special Education", position: "md:bottom-[10%] md:left-[10%] lg:bottom-[10%] lg:left-[10%]" },
    ],
  },
];

/**
 * Services carousel.
 *
 * Same five categories, same slide state, same `PregnancyStages` wiring
 * (`onStageHover` / `activeIndex`), same images.
 *
 * The service labels used to be absolutely positioned over the illustration using
 * a hand-tuned string per label per slide — `md:top-[25%] md:left-[20%]` and
 * twenty-one more like it. Three problems: they were `hidden` below `lg`, so the
 * information only existed on large screens; they were `bg-white/20` with
 * `text-gray-800`, which is roughly 1.8:1 against a light illustration and fails
 * WCAG AA by a wide margin; and the coordinates were tuned against one image
 * aspect ratio, so they drifted over the artwork at other widths.
 *
 * They are a chip row below the illustration now: readable, present at every
 * breakpoint, and nothing to re-tune when an image changes. The `position` values
 * in COURSES_DATA are consequently unused — left in place so the data shape is
 * unchanged.
 */
const ServicesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = COURSES_DATA[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === COURSES_DATA.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? COURSES_DATA.length - 1 : prev - 1,
    );
  };

  return (
    <section className="section-y bg-surface">
      <div className="container-page">
        <PregnancyStages
          onStageHover={setCurrentIndex}
          activeIndex={currentIndex}
        />

        <div className="relative mt-10 md:mt-14">
          {/* Illustration */}
          <div className="relative mx-auto flex w-full max-w-4xl items-center justify-center">
            <button
              onClick={prevSlide}
              aria-label="Previous category"
              className="absolute left-0 top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-body shadow-sm transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 md:-left-4"
            >
              <ChevronLeft className="size-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[4/3] w-full max-w-3xl sm:aspect-[16/10]"
              >
                <Image
                  src={current?.mainImage + ""}
                  alt={current?.category + ""}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={nextSlide}
              aria-label="Next category"
              className="absolute right-0 top-1/2 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-body shadow-sm transition-colors duration-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 md:-right-4"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Category name and its services */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id + "-services"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="mx-auto mt-8 max-w-3xl text-center"
            >
              <h3 className="text-xl font-semibold text-ink sm:text-2xl">
                {current?.category}
              </h3>

              <ul className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-2.5">
                {current?.services?.map((service) => (
                  <li key={service.label}>
                    <span className="inline-flex items-center rounded-full border border-hairline bg-canvas px-3.5 py-2 text-sm font-medium text-body transition-colors duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800">
                      {service.label}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicator */}
          <div className="mt-8 flex justify-center gap-2">
            {COURSES_DATA.map((course, idx) => (
              // The visible dot is 8px, but the tappable box around it is 40x40 —
              // a bare 8px control is well under any usable touch target.
              <button
                key={course.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Show ${course.category}`}
                aria-current={idx === currentIndex}
                className="group flex size-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "h-2 rounded-full transition-all duration-300",
                    idx === currentIndex
                      ? "w-8 bg-primary-600"
                      : "w-2 bg-slate-300 group-hover:bg-slate-400",
                  ].join(" ")}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesCarousel;
