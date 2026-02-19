"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const STAGES_DATA = [
    {
        id: "pre-pregnancy",
        prefix: "",
        title: "Women’s health",
        bgColor: "bg-[#C8B8D9]",
        textColor: "text-[#6B5B7A]",
        carouselIndex: 0, // Woman Wellbeing
    },
    {
        id: "1st-trimester",
        prefix: "",
        title: "Pregnancy Planning",
        bgColor: "bg-[#C5E1C0]",
        textColor: "text-[#4A5B4A]",
        carouselIndex: 3, // PCOS
    },
    {
        id: "2nd-trimester",
        prefix: "",
        title: "Prenatal Care",
        bgColor: "bg-[#B5E5E0]",
        textColor: "text-[#4A6B68]",
        carouselIndex: 1, // Prenatal Care
    },
    {
        id: "3rd-trimester",
        prefix: "",
        title: "Postnatal Care",
        bgColor: "bg-[#A8D8D5]",
        textColor: "text-[#4A6B68]",
        carouselIndex: 2, // Postnatal Care
    },
    {
        id: "post-partum",
        prefix: "",
        title: "Child Health care",
        bgColor: "bg-[#B8C4E8]",
        textColor: "text-[#5B6B8A]",
        carouselIndex: 4, // Child Healthcare
    },
];

interface PregnancyStagesProps {
    onStageHover?: (carouselIndex: number) => void;
}

export default function PregnancyStages({ onStageHover }: PregnancyStagesProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <section className="px-4 sm:px-6 md:px-12 lg:px-[100px] pt-4 md:pt-6 pb-8 md:pb-12 w-full bg-white overflow-hidden">
            <div className="mx-auto px-0">

                {/* Stages Cards */}
                <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                    {STAGES_DATA.map((stage, index) => {
                        const isMobileLastItem = STAGES_DATA.length % 2 === 1 && index === STAGES_DATA.length - 1;
                        
                        return (
                        <motion.div
                            key={stage.id}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            onMouseEnter={() => {
                                setHoveredId(stage.id);
                                onStageHover?.(stage.carouselIndex);
                            }}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`relative flex h-24 sm:h-28 md:h-32 lg:h-36 w-full items-center justify-center overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[30px] ${stage.bgColor} p-3 sm:p-4 md:p-5 lg:p-6 font-sans shadow-lg cursor-pointer group ${isMobileLastItem ? 'col-span-2 sm:col-span-1 sm:col-auto' : ''}`}
                        >
                            {/* The large Gradient Text */}
                            <h1 className="absolute left-2 top-0 text-3xl sm:text-5xl md:text-6xl lg:text-[80px] font-black leading-none tracking-tighter select-none">
                                <span className={`bg-gradient-to-b from-black/30 to-transparent bg-clip-text text-transparent`}>
                                    {stage.prefix}
                                </span>
                            </h1>

                            {/* The Title Text */}
                            <h2 className="relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 self-end text-right text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white z-20 drop-shadow-sm uppercase">
                                {stage.title}
                            </h2>
                        </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
