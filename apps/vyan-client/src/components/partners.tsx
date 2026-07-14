"use client";
import React from "react";
import { motion } from "framer-motion";

const Partners = () => {
  const partners = [
    { name: "IIT Mandi", logo: "/images/trustees/iitmandi.webp" },
    { name: "DST NIDHI", logo: "/images/trustees/dstnidhi.webp" },
    { name: "Meit", logo: "/images/trustees/meit.webp" },
    { name: "BBCentre", logo: "/images/trustees/bbc-logo.webp" },
    { name: "Startup India", logo: "/images/trustees/startup.webp" },
  ];

  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="overflow-hidden bg-white px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      <div className="text-center">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Our Sponsors
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            Together, we empower motherhood with expertise.
          </p>
        </div>

        {/* Infinite Marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16 bg-gradient-to-r from-white to-transparent sm:w-24 md:w-32 lg:w-40" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-white to-transparent sm:w-24 md:w-32 lg:w-40" />

          {/* Seamless infinite scroll track */}
          <motion.div
            className="flex w-max gap-4 py-4 sm:gap-6 md:gap-8"
            animate={{ x: [0, "-50%"] }}
            transition={{
              ease: "linear",
              duration: 18,
              repeat: Infinity,
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={index}
                className="relative z-10 flex h-14 w-28 flex-shrink-0 items-center justify-center p-2 sm:h-18 sm:w-36 md:h-20 md:w-40 md:p-3"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 w-auto object-contain opacity-80 transition-opacity duration-200 hover:opacity-100 sm:h-10 md:h-12"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
