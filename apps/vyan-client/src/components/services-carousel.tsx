"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const COURSES_DATA = [
  {
    id: 1,
    category: "Child Healthcare",
    mainImage: "/home/Group 39661.png",
    services: [
      { label: "Lifestyle Issue", position: "top-[10%] left-[5%]" },
      { label: "Nutritional Issue", position: "top-[10%] right-[5%]" },
      { label: "Development Challenge", position: "bottom-[20%] left-[5%]" },
      { label: "Behavioral Challenge", position: "bottom-[20%] right-[5%]" },
    ],
  },
  {
    id: 2,
    category: "Woman Wellbeing",
    mainImage: "/home/Group 39661-2.png",
    services: [
      { label: "Mental Wellbeing", position: "top-[10%] right-[5%]" },
      { label: "Physical Health", position: "bottom-[20%] right-[5%]" },
      { label: "Lifestyle Issue", position: "top-[10%] left-[5%]" },
      { label: "Overweight", position: "bottom-[20%] left-[5%]" },
    ],
  },
  {
    id: 3,
    category: "Pregnancy Care",
    mainImage: "/home/Group 39661-3.png",
    services: [
      { label: "Prenatal Care", position: "top-[10%] left-[5%]" },
      { label: "Nutrition Guide", position: "top-[10%] right-[5%]" },
      { label: "Exercise Programs", position: "bottom-[20%] left-[5%]" },
      { label: "Mental Support", position: "bottom-[20%] right-[5%]" },
    ],
  },
  {
    id: 4,
    category: "Postnatal Support",
    mainImage: "/home/Group 39661-4.png",
    services: [
      { label: "Recovery Care", position: "top-[10%] left-[5%]" },
      { label: "Breastfeeding", position: "top-[10%] right-[5%]" },
      { label: "Baby Care", position: "bottom-[20%] left-[5%]" },
      { label: "Mental Health", position: "bottom-[20%] right-[5%]" },
    ],
  },
  {
    id: 5,
    category: "Family Wellness",
    mainImage: "/home/Group 39661-5.png",
    services: [
      { label: "Parenting Tips", position: "top-[10%] left-[5%]" },
      { label: "Family Bonding", position: "top-[10%] right-[5%]" },
      { label: "Child Development", position: "bottom-[20%] left-[5%]" },
      { label: "Healthy Habits", position: "bottom-[20%] right-[5%]" },
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
    <section className="relative mt-[70px] min-h-screen w-full overflow-hidden bg-white py-12 md:py-20">
      <div className="z-10 max-w-full px-0 text-center ">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className=" mb-6 font-poppins text-xl font-medium leading-tight text-[#333333] md:text-2xl lg:text-5xl"
        >
          India's Wellness Circle For Women Who Mother With Intention
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mx-auto mb-[100px] max-w-5xl font-poppins text-lg font-medium leading-relaxed text-gray-600 md:text-xl"
        >
          Tap into curated care programs and ancient wisdom to raise happy moms
          and healthy babies with expert-led sessions and wellness products.
          Shewell isn’t just for India. It’s for every woman, everywhere
        </motion.p>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        {/* Carousel Container */}
        <div className="relative flex flex-col items-center">
          {/* Main Image Area with Title Integrated */}
          <div className="relative mb-12 flex w-full items-center justify-center md:mb-16">
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="relative h-[400px] w-full max-w-4xl md:h-[500px] lg:h-[600px]"
              >
                <Image
                  src={current?.mainImage + ""}
                  alt={current?.category + ""}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
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
                  className={`absolute z-20 flex h-[60px] w-[200px] cursor-pointer
                                    flex-row items-center justify-between
                                    gap-2 rounded-[18px] border
                                    border-white/30 bg-white/20 px-4 py-3
                                    shadow-lg backdrop-blur-[7px]
                                    transition-all duration-300 hover:scale-105
                                    hover:bg-white/30 md:h-[80px] md:w-[300px]
                                    md:px-5 lg:h-[100px] lg:w-[380px] ${service.position}`}
                >
                  <div className="flex-shrink-0 rounded-full bg-[#167D71] p-2 text-white md:p-3">
                    <ArrowUpRight size={18} className="md:h-5 md:w-5" />
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-800 md:text-base lg:text-lg">
                    {service.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 p-2 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-600 md:left-4 md:p-3"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-gray-200 p-2 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-600 md:right-4 md:p-3"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="mb-12 flex gap-2 md:mb-16">
            {COURSES_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 w-3 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-8 bg-[#167D71]"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Footer Text */}
        </div>
      </div>
    </section>
  );
};

export default ServicesCarousel;
