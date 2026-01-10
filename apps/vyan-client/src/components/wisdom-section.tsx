"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDownLeft } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";

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
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              Wisdom That Grows With You.
            </h2>
            <p className="max-w-2xl text-base text-gray-600 md:text-lg">
              Real stories, expert tips, and honest advice - for every moment,
              milestone, and mess.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => scroll("left")}
              className="rounded-full border border-gray-300 p-3 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="rounded-full border border-gray-300 p-3 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>

        {/* Articles Carousel */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-6 overflow-x-auto pb-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ARTICLES_DATA.map((article) => (
            <motion.div
              key={article.id}
              onMouseEnter={() => setHoveredId(article.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group flex w-80 flex-shrink-0 cursor-pointer flex-col md:w-[22rem]"
            >
              {/* Image Placeholder */}
              <div className="mb-6 h-56 w-full overflow-hidden rounded-2xl bg-[#F5FBFB]">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>,
                  ) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x300?text=Article";
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex flex-grow flex-col">
                <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#167D71]">
                  {article.date}
                </span>
                <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-[#167D71]">
                  {article.title}
                </h3>
                <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-gray-500">
                  {article.description}
                </p>

                {/* Read More Button */}
                <div className="mt-auto">
                  <button className="order-0 group flex h-[45px] w-full flex-grow flex-row items-center justify-between gap-2.5 rounded-2xl bg-[#F2F2F2] px-4 py-0 transition-all duration-300 ease-in-out hover:bg-[#e5e5e5]">
                    <span className="text-lg font-medium text-[#00000066] sm:text-[17px]">
                      Shop Now
                    </span>
                    <InteractiveButton size="small" />
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
