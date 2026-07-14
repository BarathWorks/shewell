"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

const FAQ_CONTENT = [
  {
    question: "What is Shewell and who is it for?",
    answer:
      "Shewell is a one-stop digital wellness platform offering expert-led care for women through all stages—from fertility to postpartum. It's designed for moms-to-be, new mothers, and caregivers seeking holistic support.",
  },
  {
    question: "Are the sessions suitable for all stages of pregnancy?",
    answer:
      "Yes! Our programs are designed trimester-wise, so whether you're in your first or third trimester, you'll receive the right support for your stage.",
  },
  {
    question: "What is SheFit and how does it work?",
    answer:
      "SheFit is our trimester-based prenatal yoga and breathwork program. Each session is tailored to your energy, physical needs, and comfort level.",
  },
  {
    question: "Can I book private 1-on-1 yoga sessions?",
    answer:
      "Absolutely! We offer personalized sessions that adapt to your schedule and specific body needs—whether for pregnancy, recovery, or relaxation.",
  },
];

const ShewellFAQ = () => {
  // Click-to-toggle; first item open by default
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="overflow-hidden bg-white px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20">
      <div className="w-full">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900">
            Something on Your Mind? Let's Talk.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#33333399]">
            No matter where you are — questions, doubts, or curiosity — we're here to listen and help.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-2 sm:space-y-3">
          {FAQ_CONTENT.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-xl border transition-all duration-300 sm:rounded-2xl ${
                  isOpen
                    ? "border-[#167D71] bg-[#00898F] shadow-lg"
                    : "border-transparent bg-[#F8F9FA] hover:border-gray-200"
                }`}
              >
                {/* Question Row */}
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left sm:px-6 sm:py-5 md:px-8 md:py-6"
                >
                  <span
                    className={`text-sm sm:text-base md:text-lg font-medium transition-colors duration-300 ${
                      isOpen ? "text-white" : "text-[#0F4946]"
                    }`}
                  >
                    {item.question}
                  </span>

                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 rounded-full border p-1.5 transition-all duration-300 sm:p-2 ${
                      isOpen
                        ? "border-white bg-white text-[#167D71]"
                        : "border-gray-200 bg-white text-[#167D71]"
                    }`}
                  >
                    {isOpen ? (
                      <ChevronDown size={16} className="sm:size-5" />
                    ) : (
                      <ChevronRight size={16} className="sm:size-5" />
                    )}
                  </div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="px-4 pb-4 sm:px-6 sm:pb-5 md:px-8 md:pb-7">
                        <p className="text-sm sm:text-base leading-relaxed text-white/90">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShewellFAQ;
