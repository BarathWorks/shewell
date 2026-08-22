"use client";
import React from "react";
import { motion } from "framer-motion";

/**
 * Decorative band between the hero and the services carousel.
 *
 * The block was `md:h-screen` (and again at `lg`, `xl` and `2xl`) around a single
 * illustration held at `md:opacity-20`. That reserved a full viewport of near-empty
 * page immediately below the hero, so on a laptop a visitor scrolled past a
 * screenful of almost nothing before reaching any content. It is a sized band now.
 *
 * The commented-out Amatic SC heading below it is left where it was — it is the
 * only remaining consumer of that font family and removing it would strand the
 * font load.
 */
const WellnessCircle = () => {
  return (
    <div className="overflow-hidden bg-surface">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center py-8 md:py-12"
        >
          <img
            src="/home/Vector.png"
            alt=""
            aria-hidden="true"
            className="h-auto w-full max-w-3xl object-contain opacity-30 transition-opacity duration-500 ease-out hover:opacity-70"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessCircle;
