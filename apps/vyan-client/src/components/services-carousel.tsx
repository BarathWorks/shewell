"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { InteractiveButton } from "./ui/interactive-button";
import PregnancyStages from "./pregnancy-stages";

const COURSES_DATA = [
  {
    id: 1,
    category: "Women’s health",
    mainImage: "/home/Women’s-health.webp",
    services: [
      { label: "Diet", position: "top-[25%] left-[20%]" },
      { label: "PCOS", position: "top-[25%] right-[20%]" },
      { label: "Emotional wellbeing", position: "bottom-[10%] left-[15%]" },
      { label: "Wellness", position: "bottom-[10%] right-[15%]" },
    ],
  },
  {
    id: 2,
    category: "Pregency Planning",
    mainImage: "/home/Pregnancy-Planning.webp",
    services: [
      { label: "Fertility diet", position: "top-[25%] left-[20%]" },
      { label: "Fertility couple mindset", position: "top-[25%] right-[20%]" },
      { label: "Fertility fitness", position: "bottom-[10%] left-[20%]" },
    ],
  },
  {
    id: 3,
    category: "Prenatal Care",
    mainImage: "/home/Prenatal Care.webp",
    services: [
      { label: "Pregnancy Nutrition", position: "top-[32%] left-[15%]" },
      { label: "Garbh Sanskar", position: "top-[15%] right-[20%]" },
      { label: "Childbirth education", position: "bottom-[13%] left-[17%]" },
      { label: "Emotional wellbeing", position: "bottom-[05%] right-[15%]" },
      { label: "Pregnancy Selfcare", position: "bottom-[38%] right-[12%]" },
    ],
  },
  {
    id: 4,
    category: "Postnatal Care",
    mainImage: "/home/service-postnatal.webp",
    services: [
      { label: "Lactational counselling", position: "top-[25%] left-[20%]" },
      { label: "Postnatal Diet", position: "top-[25%] right-[20%]" },
      { label: "Postpartum depression", position: "bottom-[10%] left-[20%]" },
      { label: "Moms fitness", position: "bottom-[20%] right-[20%]" },
    ],
  },

  {
    id: 5,
    category: "Child Healthcare",
    mainImage: "/home/service-child.webp",
    services: [
      { label: "Child psychology", position: "top-[25%] left-[15%]" },
      { label: "Child nutrition", position: "top-[25%] right-[15%]" },
      {
        label: "Speech language therapy",
        position: "top-[60%] left-[40%]",
      },
      { label: "Occupational therapy", position: "bottom-[10%] right-[10%]" },
      { label: "Special Education", position: "bottom-[10%] left-[10%]" },
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
    <section className="relative flex min-h-fit w-full flex-col justify-center bg-white px-4 py-4 sm:min-h-screen sm:px-6 sm:py-6 md:px-12 lg:px-[100px]">
      {/* <div className="z-10 max-w-full px-0 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-4 font-poppins text-base font-medium leading-tight text-[#333333] sm:mb-6 sm:text-lg sm:leading-tight md:text-2xl md:leading-tight lg:text-4xl lg:leading-tight xl:text-[54px] xl:leading-[1.2] xs:text-[22px]"
        >
          India's Wellness Circle For Women Who Mother With Intention
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mb-6 px-2 text-xs text-[#33333399] sm:mb-8 sm:px-4 sm:text-sm md:mb-12 md:px-6 md:text-lg lg:text-2xl lg:text-[26px] xl:text-[26px] xl:text-[28px]"
        >
          Tap into curated care programs and ancient wisdom to raise happy moms
          and healthy babies with expert led sessions and wellness products.
          Shewell isn’t just for India. It’s for every woman, everywhere
        </motion.p>
      </div> */}
      <PregnancyStages
        onStageHover={setCurrentIndex}
        activeIndex={currentIndex}
      />
      <div className=" w-full px-0">
        {/* Carousel Container */}
        <div className="relative flex flex-col items-center">
          {/* Main Image Area with Title Integrated */}
          <div className="relative mb-2 flex w-full items-center justify-center sm:mb-8 md:mb-10">
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="relative h-[250px] w-full max-w-5xl sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px]"
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

            {/* Service Labels (Bubbles) */}
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
                                    shadow-lg backdrop-blur-[7px] transition-all duration-300 hover:scale-105 hover:bg-white/30 sm:flex
                                    sm:h-14 sm:w-36 sm:gap-2 sm:rounded-2xl sm:px-2.5 sm:py-2 md:h-20 md:w-64 md:gap-3
                                    md:rounded-[18px] md:px-4
                                    md:py-3 lg:h-[100px] lg:w-[380px]
                                    lg:px-5 ${service.position}`}
                >
                  <div className="flex-shrink-0 p-0.5 text-white sm:p-1.5 md:p-2.5">
                    <InteractiveButton />
                  </div>
                  <span className="whitespace-nowrap text-[8px] font-semibold text-gray-800 sm:text-xs md:text-sm lg:text-base">
                    {service.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-1 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 p-1.5 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-600 sm:left-2 sm:p-2 md:left-0 md:p-3"
            >
              <ChevronLeft size={20} className="sm:size-6 md:size-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-1 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 p-1.5 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-600 sm:right-2 sm:p-2 md:right-0 md:p-3"
            >
              <ChevronRight size={20} className="sm:size-6 md:size-8" />
            </button>
          </div>

          {/* Dots Indicator
          <div className="mb-12 flex gap-2 md:mb-16">
            {COURSES_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 w-3 rounded-full transition-all ${idx === currentIndex
                    ? "w-8 bg-[#167D71]"
                    : "bg-gray-300 hover:bg-gray-400"
                  }`}
              />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default ServicesCarousel;
