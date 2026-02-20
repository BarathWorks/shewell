"use client";
import React from "react";
import { motion } from "framer-motion";

const overallVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
};

const WellnessCircle = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
      {/* 1. Illustration Area */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 w-full px-0"
      >
        {/* Mother and Baby Illustration */}
        <img
          src="/home/Vector.png"
          alt="Mother and baby illustration"
          className="mx-auto mb-8 h-auto w-full cursor-pointer object-cover opacity-20 transition-opacity ease-in-out hover:opacity-100"
        />
        {/* Shewell Title */}
        <h1 className="mx-auto cursor-pointer text-center font-amatic-sc text-4xl font-bold tracking-wide text-primary opacity-40 transition-opacity duration-500 ease-in-out hover:opacity-100 sm:text-5xl md:text-6xl lg:text-7xl">
          Shewell
        </h1>
      </motion.div>

      {/* 2. Cursive Script Heading */}
      <motion.div
        variants={overallVariant}
        initial="hidden"
        animate="visible"
        className="mb-0 px-2 text-center"
      >
        <h2 className="flex flex-wrap justify-center gap-2 font-amatic-sc text-2xl font-bold tracking-wide text-primary sm:gap-3 sm:text-3xl md:gap-6 md:text-4xl lg:text-5xl lg:text-7xl xl:text-6xl xl:text-8xl 2xl:text-7xl">
          <span className="cursor-default text-primary opacity-50 transition-opacity duration-500 ease-in-out hover:opacity-100">
            For her body,{" "}
          </span>
          <span className="cursor-default text-primary opacity-50 transition-opacity duration-500 ease-in-out hover:opacity-100">
            her mind,{" "}
          </span>
          <span className="cursor-default text-primary opacity-50 transition-opacity duration-500 ease-in-out hover:opacity-100">
            and{" "}
          </span>
          <span className="cursor-default text-primary opacity-50 transition-opacity duration-500 ease-in-out hover:opacity-100">
            her baby
          </span>
        </h2>
      </motion.div>
    </div>
  );
};

export default WellnessCircle;
