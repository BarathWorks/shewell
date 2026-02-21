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
    <section className="w-full overflow-hidden bg-white px-4 pb-8 pt-4 sm:px-6 md:px-12 md:pb-12 md:pt-6 lg:px-[100px]">
      <div className="mx-auto px-0">
        {/* Stages Cards */}
        <div className="grid w-full grid-cols-2 gap-2 opacity-80 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-5 lg:gap-6">
          {STAGES_DATA.map((stage, index) => {
            const isMobileLastItem =
              STAGES_DATA.length % 2 === 1 && index === STAGES_DATA.length - 1;
            const isActive = activeIndex === stage.carouselIndex;

            return (
              <motion.div
                key={stage.id}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => {
                  setHoveredId(stage.id);
                  onStageHover?.(stage.carouselIndex);
                }}
                onClick={() => {
                  onStageHover?.(stage.carouselIndex);
                }}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative flex h-20 w-full items-center justify-center overflow-hidden rounded-lg sm:h-24 sm:rounded-xl md:h-28 md:rounded-2xl lg:h-32 lg:rounded-[30px] ${stage.bgColor} group cursor-pointer p-3 font-sans shadow-lg sm:p-4 md:p-5 lg:p-6 ${isMobileLastItem ? "col-span-2 sm:col-auto sm:col-span-1" : ""} ${isActive ? "saturate-110 scale-105 shadow-xl ring-4 ring-black/10 ring-offset-2" : "opacity-80 hover:opacity-100 hover:shadow-xl"}`}
              >
                {/* The large Gradient Text */}
                <h1 className="absolute -top-2 left-2 select-none text-3xl font-black leading-none tracking-tighter opacity-70 sm:text-5xl md:text-6xl lg:text-[80px]">
                  <span
                    className={`bg-gradient-to-b from-black/40 to-black/10 bg-clip-text text-transparent`}
                  >
                    {stage.prefix}
                  </span>
                </h1>

                {/* The Title Text */}
                <h2 className="relative z-20 ml-auto mt-auto max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm font-bold uppercase leading-tight tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] sm:text-base md:text-lg lg:text-lg">
                  {stage.title}
                </h2>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
