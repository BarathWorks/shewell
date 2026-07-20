"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { InteractiveButton } from "./ui/interactive-button";
import PregnancyStages from "./pregnancy-stages";

const COURSES_DATA = [
  {
    id: 1,
    category: "Women's health",
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
    category: "Pregnancy Planning",
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
      { label: "Speech language therapy", position: "md:top-[60%] md:left-[40%] lg:top-[60%] lg:left-[40%]" },
      { label: "Occupational therapy", position: "md:bottom-[10%] md:right-[10%] lg:bottom-[5%] lg:right-[10%]" },
      { label: "Special Education", position: "md:bottom-[10%] md:left-[10%] lg:bottom-[10%] lg:left-[10%]" },
    ],
  },
];

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
    <section className="relative flex min-h-fit w-full flex-col justify-center bg-white px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      <PregnancyStages
        onStageHover={setCurrentIndex}
        activeIndex={currentIndex}
      />
      <div className="w-full px-0">
        {/* Carousel Container */}
        <div className="relative flex flex-col items-center">
          {/* Main Image Area */}
          <div className="relative mb-4 sm:mb-6 md:mb-8 flex w-full items-center justify-center">
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="relative h-[220px] sm:h-[340px] md:h-[450px] lg:h-[550px] xl:h-[640px] w-full max-w-5xl"
              >
                <Image
                  src={current?.mainImage + ""}
                  alt={current?.category + ""}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                />
              </motion.div>
            </AnimatePresence>

            {/* Service Labels (Bubbles) - desktop only */}
            <AnimatePresence>
              {current?.services?.map((service, idx) => (
                <motion.div
                  key={`${current?.id}-${idx}`}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className={`absolute z-20 hidden h-10 w-28 cursor-pointer flex-row items-center justify-between gap-1.5 rounded-lg border border-white/30
                              bg-white/20 px-1.5 py-1.5
                              shadow-lg backdrop-blur-[7px] transition-all duration-300 hover:scale-105 hover:bg-white/30 lg:flex
                              sm:h-14 sm:w-36 sm:gap-2 sm:rounded-2xl sm:px-2.5 sm:py-2 md:h-20 md:w-64 md:gap-3
                              md:rounded-[18px] md:px-4 md:py-3 lg:h-[100px] lg:w-[380px] lg:px-5 ${service.position}`}
                >
                  <div className="flex-shrink-0 p-0.5 text-white sm:p-1.5 md:p-2.5">
                    <InteractiveButton as="span" />
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold text-gray-800 md:text-sm lg:text-base">
                    {service.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-1 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-800 sm:left-2 md:left-0 md:p-3"
            >
              <ChevronLeft size={20} className="sm:size-6 md:size-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-1 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-800 sm:right-2 md:right-0 md:p-3"
            >
              <ChevronRight size={20} className="sm:size-6 md:size-8" />
            </button>
          </div>

          {/* Mobile service tag pills */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id + "-mobile-services"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex w-full max-w-3xl flex-wrap justify-center gap-2 pb-2 lg:hidden"
            >
              {current?.services?.map((service) => (
                <span
                  key={service.label}
                  className="rounded-full border border-[#D9D9D9] bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
                >
                  {service.label}
                </span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ServicesCarousel;
