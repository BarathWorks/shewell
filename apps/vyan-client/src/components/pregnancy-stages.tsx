"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const STAGES_DATA = [
  {
    id: "pre-pregnancy",
    prefix: "01",
    title: "Women’s health",
    bgColor: "bg-[#D3B155]",
    textColor: "text-[#6B5B7A]",
    carouselIndex: 0, // Woman Wellbeing
  },
  {
    id: "1st-trimester",
    prefix: "02",
    title: "Pregnancy Planning",
    bgColor: "bg-[#D35590]",
    textColor: "text-[#4A5B4A]",
    carouselIndex: 1, // PCOS
  },
  {
    id: "2nd-trimester",
    prefix: "03",
    title: "Prenatal Care",
    bgColor: "bg-[#D355B6B2]",
    textColor: "text-[#4A6B68]",
    carouselIndex: 2, // Prenatal Care
  },
  {
    id: "3rd-trimester",
    prefix: "04",
    title: "Postnatal Care",
    bgColor: "bg-[#A9D355]",
    textColor: "text-[#4A6B68]",
    carouselIndex: 3, // Postnatal Care
  },
  {
    id: "post-partum",
    prefix: "05",
    title: "Child Health care",
    bgColor: "bg-[#5577D3B2]",
    textColor: "text-[#5B6B8A]",
    carouselIndex: 4, // Child Healthcare
  },
];

interface PregnancyStagesProps {
  onStageHover?: (carouselIndex: number) => void;
  activeIndex?: number;
}

export default function PregnancyStages({
  onStageHover,
  activeIndex,
}: PregnancyStagesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="w-full bg-white px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-8 pt-2 xs:pt-3 sm:pt-4 md:pb-12 md:pt-6">
      <div className="mx-auto px-0">
        {/* Stages Cards */}
        <div className="grid w-full grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 lg:grid-cols-5 lg:gap-6">
          {STAGES_DATA.map((stage, index) => {
            const isActive = activeIndex === stage.carouselIndex;

            // Responsive layout: 3 cols on mobile, 3 on tablet, 5 on desktop
            const responsiveColClasses =
              index < 3
                ? "col-span-1"
                : index === 3
                  ? "col-start-auto col-span-1 sm:col-start-auto"
                  : "col-span-1";

            return (
              <motion.div
                key={stage.id}
                whileHover={{ scale: 1.05, zIndex: 50 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => {
                  setHoveredId(stage.id);
                  onStageHover?.(stage.carouselIndex);
                }}
                onClick={() => {
                  onStageHover?.(stage.carouselIndex);
                }}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative flex flex-col justify-between items-start h-20 xs:h-24 sm:h-28 md:h-32 lg:h-40 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-[30px] ${stage.bgColor} group cursor-pointer p-2 xs:p-2.5 sm:p-3 md:p-4 lg:p-6 font-sans shadow-lg ${responsiveColClasses} ${isActive ? "saturate-110 scale-105 shadow-xl ring-4 ring-black/10 ring-offset-2 z-10" : "opacity-80 hover:opacity-100 hover:shadow-xl transition-all"}`}
              >
                {/* The large Gradient Text */}
                <div className="w-full">
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-none">
                    <span className="bg-gradient-to-b from-black/40 to-black/10 bg-clip-text text-transparent">
                      {stage.prefix}
                    </span>
                  </h1>
                </div>

                {/* The Title Text */}
                <div className="w-full">
                  <h2 className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base font-bold uppercase leading-tight tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] break-words">
                    {stage.title}
                  </h2>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
