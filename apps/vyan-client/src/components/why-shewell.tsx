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
        icon: <Users className="w-6 h-6" />,
    },
    {
        id: 2,
        title: "Most affordable virtual health services.",
        description:
            "Expert sessions, holistic care, and evidence-based guidance—without the premium price tag.",
        icon: <Banknote className="w-6 h-6" />,
    },
    {
        id: 3,
        title: "Data-Protected, Globally Certified",
        description:
            "Secure, HIPAA, and GDPR compliant systems for your peace of mind.",
        icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
        id: 4,
        title: "Across Borders, Across Cultures",
        description:
            "Clients from 110+ countries served with care that respects cultural nuances.",
        icon: <Globe className="w-6 h-6" />,
    },
    {
        id: 5,
        title: "World-Class Experts, One Click Away",
        description:
            "Certified professionals specializing in nutrition, mental health, and pediatric care.",
        icon: <Award className="w-6 h-6" />,
    },
];

const WhyShewell = () => {
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    return (
      <section className="overflow-hidden  bg-[#F5F5F5] px-4 py-16 sm:px-6 sm:py-24 md:px-12 md:py-32 lg:px-[100px]">
        <div className="flex h-full w-full flex-col items-stretch gap-3 sm:gap-4 md:gap-6 lg:flex-row lg:gap-8">
          {/* Left Image Section */}
          <div className="relative h-[300px] w-full overflow-hidden rounded-2xl shadow-lg sm:h-[400px] sm:rounded-3xl md:h-[500px] lg:h-[500px] lg:w-[50%]">
            <Image
              src="/home/why-shewell.webp"
              alt="Why Shewell"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right List */}
          <div className="flex w-full flex-col justify-between gap-2 sm:gap-3 lg:w-[60%]">
            {WHY_SHEWELL_DATA.map((item) => (
              <motion.div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 shadow-sm transition-all duration-300 sm:gap-4 sm:rounded-2xl sm:p-4 md:rounded-3xl ${
                  hoveredId === item.id
                    ? "border-[#007D79] bg-[#00898F] shadow-lg"
                    : "border-transparent bg-white hover:shadow-md"
                }`}
              >
                {/* Icon Circle */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:h-12 sm:w-12 ${
                    hoveredId === item.id
                      ? "bg-white text-[#007D79]"
                      : "bg-[#E0F2F1] text-[#007D79]"
                  }`}
                >
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`line-clamp-2 text-xs font-medium transition-colors duration-300 sm:text-base md:text-lg ${
                      hoveredId === item.id ? "text-white" : "text-[#4A4A4A]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  {/* Description shows on hover */}
                  {hoveredId === item.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 text-xs leading-relaxed text-white/90 sm:mt-2 sm:text-sm"
                    >
                      {item.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
};

export default WhyShewell;
