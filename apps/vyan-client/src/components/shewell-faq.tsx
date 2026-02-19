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
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("What We Offer");

    const tabs = ["What We Offer", "Plans & Pricing", "Trust & Safety"];

    return (
        <section className="bg-white px-4 sm:px-6 md:px-12 lg:px-[100px] py-8 sm:py-12 md:py-16 overflow-hidden">
            <div className="w-full">
                {/* Title Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-medium mb-2 sm:mb-4">
                        Something on Your Mind? Let's Talk.
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-[24px] text-[#33333399]">
                        No Matter where are - question , doubts (or) curiosity - wire here to listen and help 
                    </p>
                </div>

                {/*  Pill Tabs 
                <div className="flex justify-center gap-3 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all border ${
                                activeTab === tab
                                    ? "bg-[#167D71] text-white border-[#167D71]"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div> */}

                {/* FAQ List */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {FAQ_CONTENT.map((item, index) => (
                        <motion.div
                            key={index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`relative rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 border overflow-hidden ${hoveredIndex === index
                                    ? "bg-[#00898F] border-[#167D71] shadow-lg"
                                    : "bg-[#F8F9FA] border-transparent"
                                }`}
                        >
                            {/* Question Row */}
                            <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 cursor-pointer gap-2">
                                <span
                                    className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-[18px] font-medium transition-colors duration-300 line-clamp-2 ${hoveredIndex === index ? "text-white" : "text-[#0F4946]"
                                        }`}
                                >
                                    {item.question}
                                </span>

                                {/* Dynamic Icon */}
                                <div
                                    className={`p-1 sm:p-1.5 flex-shrink-0 rounded-full transition-all duration-300 border ${hoveredIndex === index
                                            ? "bg-white text-[#167D71]  border-white rotate-0"
                                            : "bg-white text-[#167D71] border-gray-100"
                                        }`}
                                >
                                    {hoveredIndex === index ? (
                                        <ChevronDown size={16} className="sm:size-5" />
                                    ) : (
                                        <ChevronRight size={16} className="sm:size-5" />
                                    )}
                                </div>
                            </div>

                            {/* Hover Content */}
                            <AnimatePresence>
                                {hoveredIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="px-3 sm:px-6 md:px-8 pb-3 sm:pb-4 md:pb-8">
                                            <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg xl:text-[20px] leading-relaxed">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShewellFAQ;
