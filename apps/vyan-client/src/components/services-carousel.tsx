"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const COURSES_DATA = [
    {
        id: 1,
        category: "Child Healthcare",
        mainImage: "/home/Group 39661.png",
        services: [
            { label: "Lifestyle Issue", position: "top-[10%] left-[5%]" },
            { label: "Nutritional Issue", position: "top-[10%] right-[5%]" },
            { label: "Development Challenge", position: "bottom-[20%] left-[5%]" },
            { label: "Behavioral Challenge", position: "bottom-[20%] right-[5%]" },
        ],
    },
    {
        id: 2,
        category: "Woman Wellbeing",
        mainImage: "/home/Group 39661-2.png",
        services: [
            { label: "Mental Wellbeing", position: "top-[10%] right-[5%]" },
            { label: "Physical Health", position: "bottom-[20%] right-[5%]" },
            { label: "Lifestyle Issue", position: "top-[10%] left-[5%]" },
            { label: "Overweight", position: "bottom-[20%] left-[5%]" },
        ],
    },
    {
        id: 3,
        category: "Pregnancy Care",
        mainImage: "/home/Group 39661-3.png",
        services: [
            { label: "Prenatal Care", position: "top-[10%] left-[5%]" },
            { label: "Nutrition Guide", position: "top-[10%] right-[5%]" },
            { label: "Exercise Programs", position: "bottom-[20%] left-[5%]" },
            { label: "Mental Support", position: "bottom-[20%] right-[5%]" },
        ],
    },
    {
        id: 4,
        category: "Postnatal Support",
        mainImage: "/home/Group 39661-4.png",
        services: [
            { label: "Recovery Care", position: "top-[10%] left-[5%]" },
            { label: "Breastfeeding", position: "top-[10%] right-[5%]" },
            { label: "Baby Care", position: "bottom-[20%] left-[5%]" },
            { label: "Mental Health", position: "bottom-[20%] right-[5%]" },
        ],
    },
    {
        id: 5,
        category: "Family Wellness",
        mainImage: "/home/Group 39661 -5.png",
        services: [
            { label: "Parenting Tips", position: "top-[10%] left-[5%]" },
            { label: "Family Bonding", position: "top-[10%] right-[5%]" },
            { label: "Child Development", position: "bottom-[20%] left-[5%]" },
            { label: "Healthy Habits", position: "bottom-[20%] right-[5%]" },
        ],
    },
];

const ServicesCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const current = COURSES_DATA[currentIndex];

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev === COURSES_DATA.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? COURSES_DATA.length - 1 : prev - 1
        );
    };

    return (
        <section className="relative w-full min-h-screen bg-white py-12 md:py-20 overflow-hidden mt-[70px]">
              <div className="text-center max-w-full px-0 z-10 ">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className=" text-[#333333] text-2xl md:text-4xl lg:text-[56px] font-medium font-poppins text-gray-900 mb-6 leading-tight"
                >
                        India's Wellness Circle For Women 
                        Who Mother With Intention
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="text-gray-600 text-lg md:text-xl max-w-5xl mx-auto leading-relaxed mb-[100px] font-medium font-poppins"
                >
                    Tap into curated care programs and ancient wisdom to raise happy moms and healthy babies with expert-led sessions and wellness products. Shewell isn’t just for India. It’s for every woman, everywhere
                </motion.p>
            </div>
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Carousel Container */}
                <div className="relative flex flex-col items-center">
                    {/* Main Image Area with Title Integrated */}
                    <div className="relative w-full flex items-center justify-center mb-12 md:mb-16">
                        {/* Main Image */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current?.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="relative w-full max-w-4xl h-[400px] md:h-[500px] lg:h-[600px]"
                            >
                                <Image
                                    src={current?.mainImage + ""}
                                    alt={current?.category + ""}
                                    fill
                                    className="object-contain"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Service Labels (Bubbles) */}
                        <AnimatePresence>
                            {current?.services?.map((service, idx) => (
                                <motion.div
                                    key={`${current?.id}-${idx}`}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className={`absolute z-20 flex flex-row items-center justify-between
                                    w-[200px] md:w-[300px] lg:w-[380px]
                                    h-[60px] md:h-[80px] lg:h-[100px]
                                    px-4 md:px-5 py-3 gap-2
                                    bg-white/20 backdrop-blur-[7px]
                                    rounded-[18px] border border-white/30
                                    shadow-lg hover:bg-white/30 hover:scale-105
                                    transition-all duration-300 cursor-pointer ${service.position}`}
                                >
                                    <div className="bg-[#167D71] text-white p-2 md:p-3 rounded-full flex-shrink-0">
                                        <ArrowUpRight size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-sm md:text-base lg:text-lg font-semibold text-gray-800 whitespace-nowrap">
                                        {service.label}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute z-30 left-0 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute z-30 right-0 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex gap-2 mb-12 md:mb-16">
                        {COURSES_DATA.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    idx === currentIndex
                                        ? "bg-[#167D71] w-8"
                                        : "bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Footer Text */}
                   
                </div>
            </div>
        </section>
    );
};

export default ServicesCarousel;
