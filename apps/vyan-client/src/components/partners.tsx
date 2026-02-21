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
    <section className="overflow-hidden bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-12 lg:px-20 xl:px-48">
      <div className="max-w-full px-0 text-center">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className=" mb-2 font-poppins text-base font-medium leading-tight text-[#333333] sm:mb-3 sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl"
          >
            Our Sponsors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mx-auto text-xs text-[#33333399] sm:text-sm md:text-lg lg:text-2xl xl:text-[24px] "
          >
            Together, we empower motherhood with expertise.
          </motion.p>
        </div>

        {/* Logo Container - Infinite Scroll Wrapper */}
        <div className="relative mb-12 w-full overflow-hidden sm:mb-16 md:mb-[65px]">
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-16 md:w-24 lg:w-32 xl:w-40" />

          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-16 md:w-24 lg:w-32 xl:w-40" />

          {/* The Moving Track */}
          <motion.div
            className="mt-10 flex w-max gap-2 py-3 sm:gap-3 sm:py-4 md:gap-4 lg:gap-8"
            animate={{ x: ["20%", "-50%"] }}
            transition={{
              ease: "easeInOut",
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={index}
                className="relative z-10 flex h-16 w-28 items-center justify-center p-2 sm:h-20 sm:w-32 sm:p-3 md:h-24 md:w-40 md:p-4 lg:h-28 lg:w-48"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 w-auto object-contain opacity-90 transition-all duration-100 hover:opacity-100 sm:h-10 md:h-14 lg:h-16"
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
