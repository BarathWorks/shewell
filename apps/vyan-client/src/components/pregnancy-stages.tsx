"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const STAGES_DATA = [
    {
        id: "pre-pregnancy",
        prefix: "PRE",
        title: "PREGNANCY",
        bgColor: "bg-[#C8B8D9]",
        textColor: "text-[#6B5B7A]",
    },
    {
        id: "1st-trimester",
        prefix: "1ST",
        title: "TRIMESTER",
        bgColor: "bg-[#C5E1C0]",
        textColor: "text-[#4A5B4A]",
    },
    {
        id: "2nd-trimester",
        prefix: "2ND",
        title: "TRIMESTER",
        bgColor: "bg-[#B5E5E0]",
        textColor: "text-[#4A6B68]",
    },
    {
        id: "3rd-trimester",
        prefix: "3RD",
        title: "TRIMESTER",
        bgColor: "bg-[#A8D8D5]",
        textColor: "text-[#4A6B68]",
    },
    {
        id: "post-partum",
        prefix: "POST",
        title: "PARTUM",
        bgColor: "bg-[#B8C4E8]",
        textColor: "text-[#5B6B8A]",
    },
];

export default function PregnancyStages() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <section className="w-full bg-white">
            <div className="mx-auto px-8 lg:px-16 xl:px-24">

                {/* Stages Cards */}
                <div className="grid w-full grid-cols-5 gap-6">
                    {STAGES_DATA.map((stage) => (
                        <motion.div
                            key={stage.id}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className={`relative flex h-36 w-full items-center justify-center overflow-hidden rounded-[30px] ${stage.bgColor} p-6 font-sans shadow-lg cursor-pointer group`}
                        >
                            {/* The large Gradient Text */}
                            <h1 className="absolute left-4 top-0 text-[80px] font-black leading-none tracking-tighter select-none">
                                <span className={`bg-gradient-to-b from-black/40 to-transparent bg-clip-text text-transparent`}>
                                    {stage.prefix}
                                </span>
                            </h1>

                            {/* The Title Text */}
                            <h2 className="relative mt-16 self-end text-right text-xl font-extrabold tracking-tight text-white z-10 drop-shadow-sm uppercase">
                                {stage.title}
                            </h2>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
