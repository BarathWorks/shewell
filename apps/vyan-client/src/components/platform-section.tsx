"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";

const PLATFORM_DATA = [
    {
        id: "pre-pregnancy",
        title: "Pre-Pregnancy Webinars",
        description:
            "Prepare your mind and body for a healthy pregnancy journey with expert lifestyle and nutrition guidance.",
        image: "/home/4.png",
        color: "bg-[#1D4D4F]",
    },
    {
        id: "childbirth",
        title: "Childbirth Preparatory Classes",
        description:
            "Understand every trimester, your body changes, and how to confidently prepare for labor and delivery.",
        image: "/home/5.png",
        color: "bg-[#5B418F]",
    },
    {
        id: "breastfeeding",
        title: "Breastfeeding Classes",
        description:
            "Master latching, milk supply, and common challenges to make breastfeeding natural and stress-free.",
        image: "/home/6.png",
        color: "bg-[#917C5D]",
    },
    {
        id: "solids",
        title: "Starting Solids",
        description:
            "Learn when and how to start solids with balanced, safe meal plans curated by child nutrition experts.",
        image: "/home/7.png",
        color: "bg-[#167D71]",
    },
    {
        id: "postpartum",
        title: "Postpartum Mental Wellbeing",
        description:
            "Prioritize your emotional health with tools and therapy to navigate postpartum changes with strength.",
        image: "/home/Group 39661.png",
        color: "bg-[#7A6451]",
    },
    {
        id: "6",
        title: "Postpartum Mental Wellbeing",
        description:
            "Prioritize your emotional health with tools and therapy to navigate postpartum changes with strength.",
        image: "/home/Group 39661.png",
        color: "bg-[#7A6451]",
    },
];

export default function PlatformSection() {
    const [activeTab, setActiveTab] = useState(PLATFORM_DATA[0]);
    const indexRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            indexRef.current = (indexRef.current + 1) % PLATFORM_DATA.length;
            setActiveTab(PLATFORM_DATA[indexRef.current]);
        }, 2000); // Change every 4 seconds

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Reset timer when user manually selects a tab
    const handleTabClick = (item: typeof PLATFORM_DATA[0]) => {
        setActiveTab(item);
        indexRef.current = PLATFORM_DATA.findIndex(p => p.id === item.id);
        
        // Reset the interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            indexRef.current = (indexRef.current + 1) % PLATFORM_DATA.length;
            setActiveTab(PLATFORM_DATA[indexRef.current]);
        }, 2000);
    };   

    return (
        <section className="w-full  py-16 md:py-24   overflow-hidden">

            <div className="text-center mb-16">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                            Courses That Support You - Every Step of the Way
                        </h3>
                        <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
                            From fertility to first steps – evidence-based, heart-led,
                            expert-designed just for you.
                        </p>
            </div>
            <div className="max-w-[1720px] mx-auto   rounded-[32px] overflow-hidden flex flex-col lg:flex-row h-[650px] lg:h-[795px] shadow-sm bg-white">
                {/* LEFT NAVIGATION */}
                <div className="w-full lg:w-[50%] flex flex-col  bg-white z-10">
                    <div className="">
                        {PLATFORM_DATA.map((item) => (
                            <div
                                key={item.id}
                                onMouseEnter={() => handleTabClick(item)}
                                onClick={() => handleTabClick(item)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleTabClick(item);
                                    }
                                }}
                                className={`flex items-center justify-between w-full px-8 py-4 transition-colors duration-200 text-left group rounded-lt-[32px] h-[132.5px] cursor-pointer
                            ${activeTab?.id === item.id
                                        ? "bg-[#005F5F] text-white"
                                        : "bg-[#F2F2F2] text-[#00000066] hover:bg-gray-200"
                                    }`}
                            >
                                <span className="text-base md:text-[32px] font-medium">
                                    {item.title}
                                </span>

                                {/* Icon Circle */}
                                
                                    
                                    <InteractiveButton color="bg-[#C1C1C1]" active={activeTab?.id === item.id} />
                               
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="relative w-full lg:w-[55%] h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab?.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* Full Height Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={activeTab?.image}
                                    alt={activeTab?.title}
                                    className="w-full h-full object-fit"
                                />
                                {/* Gradient Overlay for Text Readability */}
                                {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6B8E23]/90 via-[#6B8E23]/20 to-transparent" /> */}
                            </div>

                            {/* Top Text Overlay Area */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="relative z-20 w-full px-8 pt-12 md:px-12 md:pt-16"
                            >
                                {/* <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-tight drop-shadow-sm max-w-2xl">
                                    {activeTab?.description}
                                </h3> */}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
