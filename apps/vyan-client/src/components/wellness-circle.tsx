"use client";
import React from "react";
import { motion } from "framer-motion";

const WellnessCircle = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center overflow-hidden bg-white px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      {/* Illustration Area */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 w-full"
      >
        {/* Mother and Baby Illustration */}
        <img
          src="/home/Vector.png"
          alt="Mother and baby illustration"
          className="mx-auto h-[180px] sm:h-[260px] md:h-[340px] w-auto cursor-pointer object-contain opacity-70 transition-opacity ease-in-out hover:opacity-100"
        />
      </motion.div>

      {/* Cursive Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9 }}
        className="text-center"
      >
        <h2 className="font-amatic-sc text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide text-[#114668] opacity-60 transition-opacity duration-500 hover:opacity-100">
          For her body, her mind, and her baby
        </h2>
      </motion.div>
    </div>
  );
};

export default WellnessCircle;
