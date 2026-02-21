"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";
import router from "next/router";

const EXPERTS_DATA = [
  {
    id: 1,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 2,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 3,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 4,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 5,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 6,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 7,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: 8,
    role: "Specialist",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&h=300&q=80",
  },
];

export default function ExpertsCarousel() {
  const [items, setItems] = useState(EXPERTS_DATA);
  const [isHovered, setIsHovered] = useState(false);

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

  // Auto-scroll Timer
  useEffect(() => {
    if (isHovered) return; // Pause timer when user hovers

    const interval = setInterval(() => {
      handleNext();
    }, 3000); // Rotates every 3 seconds

    return () => clearInterval(interval);
  }, [handleNext, isHovered]);

  return (
    <section className="w-full overflow-hidden bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-16 md:py-14 lg:px-[100px]">
      <div className="max-w-8xl mx-auto px-0">
        {/* Section Header */}
        <div className="mb-6 text-center sm:mb-8 md:mb-12">
          <h2 className="mb-3 text-lg font-medium leading-tight text-gray-900 sm:mb-4 sm:text-xl md:mb-5 md:text-3xl lg:text-3xl xl:text-4xl">
            You're Not Alone We're Just a Click Away
          </h2>
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-[#33333399] sm:text-sm md:text-[15px] lg:text-lg xl:text-xl">
            Consult with empathetic, qualified specialists who listen, guide,
            and support your health decisions.
          </p>
        </div>

        {/* Experts Carousel */}
        <div
          className="relative flex h-[180px] items-center justify-center px-8 sm:h-[220px] sm:px-10 md:h-[320px] md:px-14 lg:h-[350px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={handlePrev}
            className="absolute left-2 z-30 rounded-full border border-gray-300 bg-white p-1.5 transition-colors hover:bg-gray-100 sm:left-4 sm:p-2 md:left-6 md:p-3"
            aria-label="Previous expert"
          >
            <ChevronLeft
              size={18}
              className="text-gray-600 sm:size-5 md:size-6"
            />
          </button>

          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.slice(0, 5).map((expert, index) => {
                const isCenter = index === 2;
                const isSide = index === 1 || index === 3;

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
                        index === 2
                          ? "2rem"
                          : index === 3 || index === 4
                            ? "1rem"
                            : "0",
                      marginRight:
                        index === 2
                          ? "2rem"
                          : index === 1 || index === 0
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
                    <div
                      className={`relative overflow-hidden rounded-full shadow-lg
                        ${isCenter ? "h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40" : "h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 lg:h-28 lg:w-28"}
                        ${!isCenter ? "grayscale-[30%]" : ""}`}
                    >
                      <img
                        src={expert.image}
                        alt="Expert"
                        className="h-full w-full object-cover"
                      />
                      {/* overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {/* Role Badge */}
                      <motion.div
                        animate={{ opacity: isCenter ? 1 : 0.6 }}
                        className={`absolute  ${isCenter ? "bottom-2 sm:bottom-4 md:bottom-8 lg:bottom-6" : "bottom-1 sm:bottom-2 md:bottom-4"} left-1/2 flex -translate-x-1/2 items-center gap-0.5 bg-transparent px-1.5 py-0.5 sm:gap-1 sm:px-2`}
                      >
                        <span className={`${isCenter ? "h-1 w-1 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 lg:w-1.5 lg:h-1.5" : "h-0.5 w-0.5 sm:h-0.5 sm:w-0.5 md:h-1 md:w-1"} rounded-full bg-white`}></span>
                        <span
                          className={`${isCenter ? "text-[8px] sm:text-[8px] md:text-[11px] lg:text-[12px]" : "text-[8px] sm:text-[8px] md:text-[9px] lg:text-[8px]"} whitespace-nowrap font-medium text-white transition-all duration-300 ease-in-out `}
                        >
                          {expert.role}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-2 z-30 rounded-full border border-gray-300 bg-white p-1.5 transition-colors hover:bg-gray-100 sm:right-4 sm:p-2 md:right-6 md:p-3"
            aria-label="Next expert"
          >
            <ChevronRight
              size={18}
              className="text-gray-600 sm:size-5 md:size-6"
            />
          </button>
        </div>

        {/* CTA Button */}
        <div
          className="mt-8 flex w-full justify-center sm:mt-10 md:mt-14 lg:mt-16"
          onClick={() => (window.location.href = "/counselling")}
        >
          <div className="order-0 group flex h-24 w-full max-w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-[#F2F2F2] px-4 py-2 transition-all duration-300 ease-in-out hover:bg-[#00898F] sm:h-14 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-12 md:h-[70px] md:rounded-2xl md:px-7 lg:h-20 lg:px-8">
            <div className="flex flex-1 justify-center">
              <span className="text-center text-xs font-medium tracking-[0.2em] text-[#00000066] group-hover:text-white sm:text-sm md:text-[16px] lg:text-[24px] xl:text-[28px]">
                BOOK A SESSION WITH OUR EXPERTS
              </span>
            </div>
            <InteractiveButton />
          </div>
        </div>
      </div>
    </section>
  );
}
