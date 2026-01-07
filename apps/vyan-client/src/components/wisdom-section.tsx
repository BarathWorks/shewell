"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDownLeft } from "lucide-react";

const ARTICLES_DATA = [
    {
        id: 1,
        date: "Posted on 14 Jan 2025",
        title: "What to Eat During Your First Trimester",
        description:
            "Recognizing organizations as collections of human beings who are motivated by varying...",
        image: "/images/blogs/blog1.png",
    },
    {
        id: 2,
        date: "Posted on 14 Jan 2025",
        title: "5 Ways to Manage Stress During Pregnancy",
        description:
            "Recognizing organizations as collections of human beings who are motivated by varying...",
        image: "/images/blogs/blog2.png",
    },
    {
        id: 3,
        date: "Posted on 14 Jan 2025",
        title: "How to Prepare for Postpartum Care",
        description:
            "Recognizing organizations as collections of human beings who are motivated by varying...",
        image: "/images/blogs/blog3.png",
    },
    {
        id: 4,
        date: "Posted on 14 Jan 2025",
        title: "Gentle Workouts for Expecting Mothers",
        description:
            "Recognizing organizations as collections of human beings who are motivated by varying...",
        image: "/images/blogs/blog1.png",
    },
    {
        id: 5,
        date: "Posted on 14 Jan 2025",
        title: "Understanding Baby Sleep Cycles",
        description:
            "Recognizing organizations as collections of human beings who are motivated by varying...",
        image: "/images/blogs/blog2.png",
    },
];

export default function WisdomSection() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="w-full py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Wisdom That Grows With You.
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg max-w-2xl">
                            Real stories, expert tips, and honest advice - for every moment,
                            milestone, and mess.
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => scroll("left")}
                            className="p-3 rounded-full border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-3 rounded-full border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            <ChevronRight size={28} />
                        </button>
                    </div>
                </div>

                {/* Articles Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {ARTICLES_DATA.map((article) => (
                        <motion.div
                            key={article.id}
                            onMouseEnter={() => setHoveredId(article.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="flex-shrink-0 w-80 md:w-[22rem] flex flex-col group cursor-pointer"
                        >
                            {/* Image Placeholder */}
                            <div className="w-full h-56 bg-[#F5FBFB] rounded-2xl mb-6 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://placehold.co/400x300?text=Article";
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-grow">
                                <span className="text-[#167D71] text-xs font-semibold uppercase tracking-wide mb-2">
                                    {article.date}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#167D71] transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {article.description}
                                </p>

                                {/* Read More Button */}
                                <div className="mt-auto">
                                    <button
                                        className="group flex items-center justify-between w-full px-4 py-2 rounded-full bg-white border border-gray-400 text-gray-500 transition-all duration-300 ease-in-out hover:bg-[#167D71] hover:text-white"
                                    >
                                        <span className="text-sm font-medium">Read More</span>
                                        <span
                                            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white transition-all duration-300 rotate-[-45deg] group-hover:rotate-[135deg] group-hover:bg-white group-hover:text-teal-600"
                                        >
                                            ➜
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
