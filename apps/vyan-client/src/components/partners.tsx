"use client";
import React from "react";
import { motion } from "framer-motion";
import SectionHeader from "./section-header";

/**
 * Sponsor marquee.
 *
 * Same five logos, same duplicated track, same reversing animation.
 *
 * "Our Sponsors" was marked up as an `<h1>`. A document should have exactly one,
 * and the page's belongs to the hero — a second one mid-page tells a screen reader
 * a new document has started. `SectionHeader` renders an `<h2>`, matching every
 * other section.
 *
 * The edge fades were hard-coded to white; they read from the section's own ground
 * now, so they keep working if the band's background ever changes.
 */
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
    <section className="section-y overflow-hidden bg-canvas">
      <div className="container-page">
        <SectionHeader
          eyebrow="Backed by"
          title="Our Sponsors"
          lead="Together, we empower motherhood with expertise."
        />
      </div>

      {/* Marquee — full-bleed so logos travel edge to edge. */}
      <div className="relative mt-10 w-full overflow-hidden md:mt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-canvas to-transparent sm:w-24 lg:w-40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-canvas to-transparent sm:w-24 lg:w-40"
        />

        <motion.ul
          className="flex w-max items-center gap-8 py-2 sm:gap-12 lg:gap-16"
          animate={{ x: ["20%", "-50%"] }}
          transition={{
            ease: "easeInOut",
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <li
              key={index}
              className="flex h-20 w-32 shrink-0 items-center justify-center sm:w-40 lg:h-24 lg:w-48"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-10 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 lg:max-h-14"
              />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default Partners;
