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
    category: "Woman Wellbeing",
    mainImage: "/home/service-wellbeing.webp",
    services: [
      { label: "Lifestyle Issue", position: "top-[25%] left-[20%]" },
      { label: "Mental Wellbeing", position: "top-[25%] right-[20%]" },
      { label: "Overweight", position: "bottom-[10%] left-[15%]" },
      { label: "Physical Health", position: "bottom-[10%] right-[15%]" },
    ],
  },
  {
    id: 2,
    category: "Prenatal Care",
    mainImage: "/home/service-prenatal.webp",
    services: [
      { label: "Pregnancy Loss", position: "top-[25%] right-[20%]" },
      { label: "Prenatal Weight Issue", position: "bottom-[10%] right-[20%]" },
      { label: "Childbirth Education", position: "top-[25%] left-[20%]" },
      { label: "Gestational Diabetes", position: "bottom-[10%] left-[20%]" },
    ],
  },
  {
    id: 3,
    category: "Postnatal Care",
    mainImage: "/home/service-postnatal.webp",
    services: [
      { label: "Lactation Counselling", position: "top-[25%] left-[20%]" },
      {
        label: "Postpartum Mental Wellbeing",
        position: "top-[25%] right-[20%]",
      },
      { label: "Postnatal Weight Loss", position: "bottom-[10%] left-[20%]" },
      { label: "Postnatal Recovery", position: "bottom-[20%] right-[20%]" },
    ],
  },
  {
    id: 4,
    category: "PCOS",
    mainImage: "/home/service-pcos.webp",
    services: [
      { label: "Polycystic Ovary Syndrome", position: "top-[25%] left-[20%]" },
      { label: "Psychological Support", position: "top-[25%] right-[20%]" },
      { label: "Overweight Issue", position: "bottom-[10%] left-[20%]" },
    ],
  },
  {
    id: 5,
    category: "Child Healthcare",
    mainImage: "/home/service-child.webp",
    services: [
      { label: "Parenting Tips", position: "top-[25%] left-[20%]" },
      { label: "Development Challenges", position: "top-[25%] right-[20%]" },
      { label: "Nutritional Issue", position: "bottom-[10%] left-[20%]" },
      { label: "Behavioral Challenges", position: "bottom-[10%] right-[20%]" },
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
    <section className="relative w-full bg-white px-4 py-6 sm:px-6 md:px-12 lg:px-[100px]">
      <div className="z-10 max-w-full px-0 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-4 sm:mb-6 font-poppins text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-[54px] font-medium leading-tight text-[#333333]"
        >
          India's Wellness Circle For Women Who Mother With Intention
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mb-6 sm:mb-8 px-2 text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-[26px] text-[#33333399] md:mb-12 sm:px-4 md:px-6 lg:text-[26px] xl:text-[28px]"
        >
          Tap into curated care programs and ancient wisdom to raise happy moms
          and healthy babies with expert led sessions and wellness products.
          Shewell isn’t just for India. It’s for every woman, everywhere
        </motion.p>
      </div>
      <PregnancyStages onStageHover={setCurrentIndex} />
      <div className=" w-full px-0">
        {/* Carousel Container */}
        <div className="relative flex flex-col items-center">
          {/* Main Image Area with Title Integrated */}
          <div className="relative mb-6 sm:mb-8 md:mb-10 flex w-full items-center justify-center">
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] w-full max-w-5xl"
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
                  className={`absolute z-20 hidden sm:flex h-10 sm:h-14 md:h-20 lg:h-[100px] w-28 sm:w-36 md:w-64 lg:w-[380px] cursor-pointer
                                    flex-row items-center justify-between
                                    gap-1.5 sm:gap-2 md:gap-3 rounded-lg sm:rounded-2xl md:rounded-[18px] border
                                    border-white/30 bg-white/20 px-1.5 sm:px-2.5 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-3
                                    shadow-lg backdrop-blur-[7px]
                                    transition-all duration-300 hover:scale-105
                                    hover:bg-white/30 ${service.position}`}
                >
                  <div className="flex-shrink-0 p-0.5 sm:p-1.5 md:p-2.5 text-white">
                    <InteractiveButton />
                  </div>
                  <span className="whitespace-nowrap text-[8px] sm:text-xs md:text-sm lg:text-base font-semibold text-gray-800">
                    {service.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-1 sm:left-2 md:left-0 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 p-1.5 sm:p-2 md:p-3 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-600"
            >
              <ChevronLeft size={20} className="sm:size-6 md:size-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-1 sm:right-2 md:right-0 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 p-1.5 sm:p-2 md:p-3 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-600"
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
