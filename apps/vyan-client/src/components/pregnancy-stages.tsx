"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const STAGES_DATA = [
  {
    id: "pre-pregnancy",
    prefix: "01",
    title: "Women's health",
    bgColor: "bg-[#D3B155]",
    carouselIndex: 0,
  },
  {
    id: "1st-trimester",
    prefix: "02",
    title: "Pregnancy Planning",
    bgColor: "bg-[#D35590]",
    carouselIndex: 1,
  },
  {
    id: "2nd-trimester",
    prefix: "03",
    title: "Prenatal Care",
    bgColor: "bg-[#D355B6B2]",
    carouselIndex: 2,
  },
  {
    id: "3rd-trimester",
    prefix: "04",
    title: "Postnatal Care",
    bgColor: "bg-[#A9D355]",
    carouselIndex: 3,
  },
  {
    id: "post-partum",
    prefix: "05",
    title: "Child Healthcare",
    bgColor: "bg-[#5577D3B2]",
    carouselIndex: 4,
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
    <section className="w-full bg-white px-4 sm:px-6 md:px-12 lg:px-24 pb-4 sm:pb-6 pt-2 sm:pt-4 md:pb-8 md:pt-4">
      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:gap-3 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 lg:gap-4">
        {STAGES_DATA.map((stage) => {
          const isActive = activeIndex === stage.carouselIndex;

          return (
            <motion.div
              key={stage.id}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.25 }}
              onMouseEnter={() => {
                setHoveredId(stage.id);
                onStageHover?.(stage.carouselIndex);
              }}
              onClick={() => {
                onStageHover?.(stage.carouselIndex);
              }}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex flex-col justify-between items-start
                /* mobile: fixed-width card for horizontal scroll */
                w-[42vw] flex-shrink-0 snap-start
                /* tablet: slightly smaller */
                sm:w-[34vw]
                /* desktop: fill grid column */
                lg:w-auto
                h-24 sm:h-28 md:h-32 lg:h-40
                rounded-xl sm:rounded-2xl lg:rounded-[30px]
                ${stage.bgColor}
                cursor-pointer p-3 sm:p-4 lg:p-6
                shadow-md transition-all duration-300
                ${isActive
                  ? "scale-[1.04] shadow-xl ring-4 ring-black/10 ring-offset-2 z-10"
                  : "opacity-80 hover:opacity-100 hover:shadow-xl"
                }`}
            >
              {/* Large gradient number */}
              <div className="w-full">
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-none">
                  <span className="bg-gradient-to-b from-black/40 to-black/10 bg-clip-text text-transparent">
                    {stage.prefix}
                  </span>
                </h3>
              </div>

              {/* Stage title */}
              <div className="w-full">
                <h4 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase leading-tight tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] break-words">
                  {stage.title}
                </h4>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
