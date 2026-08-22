"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";

const PLATFORM_DATA = [
  {
    id: "pre-pregnancy",
    title: "Pre-Pregnancy Webinars",
    description:
      "Prepare your mind and body for a healthy pregnancy journey with expert lifestyle and nutrition guidance.",
    image: "/home/1.webp",
    color: "bg-[#1D4D4F]",
  },
  {
    id: "childbirth",
    title: "Childbirth Preparatory Classes",
    description:
      "Understand every trimester, your body changes, and how to confidently prepare for labor and delivery.",
    image: "/home/1-1.webp",
    color: "bg-[#5B418F]",
  },
  {
    id: "breastfeeding",
    title: "Breastfeeding Classes",
    description:
      "Master latching, milk supply, and common challenges to make breastfeeding natural and stress-free.",
    image: "/home/1-2.webp",
    color: "bg-[#917C5D]",
  },
  {
    id: "solids",
    title: "Starting Solids",
    description:
      "Learn when and how to start solids with balanced, safe meal plans curated by child nutrition experts.",
    image: "/home/1-3.webp",
    color: "bg-primary-600",
  },
  {
    id: "postpartum",
    title: "Postpartum Mental Wellbeing",
    description:
      "Prioritize your emotional health with tools and therapy to navigate postpartum changes with strength.",
    image: "/home/1-4.webp",
    color: "bg-[#7A6451]",
  },
  {
    id: "6",
    title: "Workshop",
    description:
      "Explore ancient prenatal wisdom with guided meditation, positive affirmations, and mindful parenting",
    image: "/home/1-5.webp",
    color: "bg-[#7A6451]",
  },
];

export default function PlatformSection() {
  const [activeTab, setActiveTab] = useState(PLATFORM_DATA[0]);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % PLATFORM_DATA.length;
      setActiveTab(PLATFORM_DATA[indexRef.current]);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleTabClick = (
    item: (typeof PLATFORM_DATA)[0],
    isHover: boolean,
  ) => {
    if (isHover) {
      setActiveTab(item);
      indexRef.current = PLATFORM_DATA.findIndex((p) => p.id === item.id);
      clearInterval(intervalRef.current);
    } else {
      intervalRef.current = setInterval(() => {
        indexRef.current = (indexRef.current + 1) % PLATFORM_DATA.length;
        setActiveTab(PLATFORM_DATA[indexRef.current]);
      }, 4000);
    }
  };

  return (
    <section className="w-full overflow-hidden px-4 py-3 sm:py-4 sm:px-6 md:px-12 md:py-6 lg:px-[100px] lg:py-10">
      <div className="mb-3 sm:mb-4 text-center md:mb-8 lg:mb-12">
        <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-medium text-gray-900 md:mb-4 md:text-2xl lg:text-3xl xl:text-4xl">
          Courses That Support You Every Step of the Way
        </h3>
        <p className="mx-auto text-xs sm:text-sm md:text-base text-muted lg:text-lg xl:text-xl">
          From fertility to first steps evidence based heart led expert designed just for you.
        </p>
      </div>
      <div className="flex h-auto w-full flex-col overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[28px] bg-white shadow-sm lg:h-[650px] lg:flex-row lg:rounded-[32px] xl:h-[795px]">
        {/* LEFT NAVIGATION */}
        <div className="z-10 flex w-full flex-col bg-white lg:w-[50%] overflow-y-auto">
          <div className="flex flex-col">
            {PLATFORM_DATA.map((item) => (
              <button
                key={item.id}
                onMouseEnter={() => handleTabClick(item, true)}
                onMouseLeave={() => handleTabClick(item, false)}
                onClick={() => handleTabClick(item, false)}
                className={`rounded-lt-[32px] group flex h-12 sm:h-14 md:h-16 lg:h-[132.5px] w-full items-center justify-between gap-2 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left transition-colors duration-200
                            ${
                              activeTab?.id === item.id
                                ? "bg-[#005F5F] text-white"
                                : "bg-slate-100 text-muted hover:bg-gray-200"
                            }`}
              >
                <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium line-clamp-2 lg:line-clamp-3 flex-1">
                  {item.title}
                </span>

                {/* Icon Circle */}

                <InteractiveButton
                  as="span"
                  color="bg-[#C1C1C1]"
                  size="small"
                  active={activeTab?.id === item.id}
                  className="flex-shrink-0"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="relative h-[200px] sm:h-[280px] md:h-[400px] lg:h-[650px] xl:h-[795px] w-full overflow-hidden lg:w-[55%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full"
            >
              {/* Full Height Image */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                <img
                  src={activeTab?.image}
                  alt={activeTab?.title}
                  className="w-full h-full object-contain sm:object-contain md:object-cover lg:object-cover"
                />
                {/* Gradient Overlay for Text Readability */}
                {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6B8E23]/90 via-[#6B8E23]/20 to-transparent" /> */}
              </div>

              {/* Top Text Overlay Area */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="relative z-20 w-full px-4 pt-8 sm:px-6 sm:pt-10 md:px-8 md:pt-12 lg:px-12 lg:pt-16"
              >
                {/* <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-tight drop-shadow-sm max-w-2xl">
                                    {activeTab?.description}
                                </h3> */}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
