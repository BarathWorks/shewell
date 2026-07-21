"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatItem {
  id: number;
  value: string;
  label: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: 1,
    value: "12,000+",
    label: "Happy Clients",
  },
  {
    id: 2,
    value: "100+",
    label: "Health Coaches",
  },
  {
    id: 3,
    value: "36+",
    label: "Countries Served",
  },
  {
    id: 4,
    value: "4.9",
    label: "Google Rating",
  },
];

const StatsSection = () => {
  return (
    <section className="w-full overflow-hidden bg-[#F5F5F5] px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      <div className="w-full">
        {/* Section Header - Matching Upcoming Sessions & Why Shewell */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Our Growing Community
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            Empowering mothers and families across the globe with trusted care
          </p>
        </div>

        {/* 2x2 Grid on Mobile, 1x4 on Desktop - Matching Upcoming Sessions Card UI */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-6">
          {STATS_DATA.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group flex flex-col items-center justify-center rounded-[24px] bg-white p-6 sm:p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 min-h-[140px] sm:min-h-[170px] md:min-h-[190px]"
            >
              <span className="font-poppins text-3xl font-bold tracking-tight text-[#00898F] transition-transform duration-300 group-hover:scale-105 sm:text-4xl md:text-4xl lg:text-5xl">
                {item.value}
              </span>
              <span className="mt-2 font-poppins text-sm font-medium text-gray-700 sm:mt-3 sm:text-base md:text-lg">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
