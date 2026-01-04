"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDownLeft } from "lucide-react";

const EXPERTS_DATA = [
    {
        id: 1,
        name: "Dr. Priya Sharma",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
        id: 2,
        name: "Dr. Meera Patel",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
        id: 3,
        name: "Dr. Rahul Verma",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
        id: 4,
        name: "Dr. Anil Kumar",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
        id: 5,
        name: "Dr. Vikram Singh",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
        id: 6,
        name: "Dr. Neha Gupta",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80",
    },
    {
        id: 7,
        name: "Dr. Sanjay Reddy",
        role: "Specialist",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80",
    },
];

export default function ExpertsCarousel() {
    const [centerIndex, setCenterIndex] = useState(2);
    const containerRef = useRef<HTMLDivElement>(null);

    const getVisibleExperts = () => {
        const visible = [];
        for (let i = -2; i <= 2; i++) {
            let index = centerIndex + i;
            if (index < 0) index = EXPERTS_DATA.length + index;
            if (index >= EXPERTS_DATA.length) index = index - EXPERTS_DATA.length;
            visible.push({ ...EXPERTS_DATA[index], position: i });
        }
        return visible;
    };

    const nextSlide = () => {
        setCenterIndex((prev) => (prev + 1) % EXPERTS_DATA.length);
    };

    const prevSlide = () => {
        setCenterIndex((prev) =>
            prev === 0 ? EXPERTS_DATA.length - 1 : prev - 1
        );
    };

    const getScale = (position: number) => {
        if (position === 0) return 1.2;
        if (Math.abs(position) === 1) return 0.9;
        return 0.75;
    };

    const getOpacity = (position: number) => {
        if (position === 0) return 1;
        if (Math.abs(position) === 1) return 0.9;
        return 0.7;
    };

    const getZIndex = (position: number) => {
        return 10 - Math.abs(position);
    };

    return (
        <section className="w-full py-16 md:py-24 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        You're Not Alone - We're Just a Click Away
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-base md:text-lg">
                        Consult with empathetic, qualified specialists who listen, guide,
                        and support your health decisions.
                    </p>
                </div>

                {/* Experts Carousel */}
                <div className="relative flex items-center justify-center">
                    {/* Left Arrow */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 md:left-4 z-20 p-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-800 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Experts Container */}
                    <div
                        ref={containerRef}
                        className="flex items-center justify-center gap-2 md:gap-4 py-8"
                    >
                        {getVisibleExperts().map((expert) => (
                            <motion.div
                                key={`${expert.id}-${expert.position}`}
                                animate={{
                                    scale: getScale(expert.position),
                                    opacity: getOpacity(expert.position),
                                    zIndex: getZIndex(expert.position),
                                }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative flex flex-col items-center"
                            >
                                {/* Avatar */}
                                <div
                                    className={`relative rounded-full overflow-hidden border-4 border-white shadow-lg ${expert.position === 0
                                        ? "w-28 h-28 md:w-40 md:h-40"
                                        : "w-20 h-20 md:w-28 md:h-28"
                                        }`}
                                >
                                    <img
                                        src={expert.image}
                                        alt={expert.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Role Badge */}
                                <div className="absolute -bottom-2 flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-md">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span className="text-xs font-medium text-gray-700">
                                        {expert.role}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 md:right-4 z-30 p-3 rounded-full border border-gray-300 text-gray-600 z-20 hover:bg-gray-300 hover:text-gray-800 transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* CTA Button */}
                <div className="mt-12 md:mt-16 flex justify-center w-full">
                    <button
                        className="group flex items-center justify-between w-full  px-4 py-2 rounded-full bg-white border border-gray-400 text-gray-500 transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
                    >
                        <span className="text-sm md:text-base font-medium uppercase tracking-widest">
                            Book a Session
                        </span>
                        <span
                            className="ml-4 flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 rotate-[-45deg] group-hover:rotate-[135deg] group-hover:bg-white group-hover:text-teal-600"
                        >
                            ➜
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}
