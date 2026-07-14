"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ShieldCheck, Users, Banknote, Award } from "lucide-react";
import Image from "next/image";

const WHY_SHEWELL_DATA = [
  {
    id: 1,
    title: "India's Leading Digital Wellness Hub for Women & Children",
    description:
      "Trusted by moms and experts alike, providing a safe space for postpartum and maternal care.",
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 2,
    title: "Most affordable virtual health services.",
    description:
      "Expert sessions, holistic care, and evidence-based guidance—without the premium price tag.",
    icon: <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 3,
    title: "Data-Protected, Globally Certified",
    description:
      "Secure, HIPAA, and GDPR compliant systems for your peace of mind.",
    icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 4,
    title: "Across Borders, Across Cultures",
    description:
      "Clients from 110+ countries served with care that respects cultural nuances.",
    icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 5,
    title: "World-Class Experts, One Click Away",
    description:
      "Certified professionals specializing in nutrition, mental health, and pediatric care.",
    icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
];

const WhyShewell = () => {
  // Support click/tap toggle so mobile users can expand items
  const [activeId, setActiveId] = useState<number | null>(1);

  const handleToggle = (id: number) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="overflow-hidden bg-[#F5F5F5] px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      <div className="flex h-full w-full flex-col items-stretch gap-4 sm:gap-6 lg:flex-row lg:gap-10">
        {/* Left Image */}
        <div className="relative h-[260px] sm:h-[360px] md:h-[460px] w-full overflow-hidden rounded-2xl shadow-lg sm:rounded-3xl lg:h-auto lg:w-[45%]">
          <Image
            src="/home/why-shewell.webp"
            alt="Why Shewell"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 45vw"
          />
        </div>

        {/* Right List */}
        <div className="flex w-full flex-col justify-between gap-2 sm:gap-3 lg:w-[55%]">
          {WHY_SHEWELL_DATA.map((item) => {
            const isActive = activeId === item.id;
            return (
              <motion.div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                onMouseEnter={() => setActiveId(item.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition-all duration-300 sm:gap-4 sm:rounded-2xl sm:p-4 ${
                  isActive
                    ? "border-[#007D79] bg-[#00898F] shadow-lg"
                    : "border-transparent bg-white hover:shadow-md"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:h-12 sm:w-12 ${
                    isActive
                      ? "bg-white text-[#007D79]"
                      : "bg-[#E0F2F1] text-[#007D79]"
                  }`}
                >
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm sm:text-base md:text-lg font-medium transition-colors duration-300 ${
                      isActive ? "text-white" : "text-[#4A4A4A]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-white/90"
                    >
                      {item.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyShewell;
