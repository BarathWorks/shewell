"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Star } from "lucide-react";

const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Newborn food product for better growth",
        description: "(contains fiber, vitamins, protiens)",
        price: 1449,
        rating: 4.5,
        reviews: 56,
        image: "/images/product/prod-1-a.png",
    },
    {
        id: 2,
        name: "Newborn food product for better growth",
        description: "(contains fiber, vitamins, protiens)",
        price: 1449,
        rating: 4.5,
        reviews: 56,
        image: "/images/product/prod-1-c.png",
    },
    {
        id: 3,
        name: "Newborn food product for better growth",
        description: "(contains fiber, vitamins, protiens)",
        price: 1449,
        rating: 4.5,
        reviews: 56,
        image: "/images/product/prod-1-c.png",
    },
    {
        id: 4,
        name: "Newborn food product for better growth",
        description: "(contains fiber, vitamins, protiens)",
        price: 1449,
        rating: 4.5,
        reviews: 56,
        image: "/images/product/prod-1-d.png",
    },
    {
        id: 5,
        name: "Newborn food product for better growth",
        description: "(contains fiber, vitamins, protiens)",
        price: 1449,
        rating: 4.5,
        reviews: 56,
        image: "/images/product/prod-1-a.png",
    },
    {
        id: 6,
        name: "Newborn food product for better growth",
        description: "(contains fiber, vitamins, protiens)",
        price: 1449,
        rating: 4.5,
        reviews: 56,
        image: "/images/product/prod-1-b.png",
    },
];

export default function ProductsGrid() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const renderStars = (rating: number) => {
        const stars: React.ReactNode[] = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Star
                        key={i}
                        size={14}
                        className="fill-pink-500 text-pink-500"
                    />
                );
            } else if (i === fullStars && hasHalf) {
                stars.push(
                    <Star
                        key={i}
                        size={14}
                        className="fill-pink-500/50 text-pink-500"
                    />
                );
            } else {
                stars.push(
                    <Star key={i} size={14} className="text-gray-300" />
                );
            }
        }
        return stars;
    };

    return (
        <section className="w-full py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                            Clean, Safe, Conscious - For You and Baby.
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg max-w-3xl">
                            Toxin-free, cruelty-free, and consciously created maternity
                            products - all validated by experts and moms alike.
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-3 rounded-full border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-3 rounded-full border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Products Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {PRODUCTS_DATA.map((product) => (
                        <motion.div
                            key={product.id}
                            onMouseEnter={() => setHoveredId(product.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            animate={{
                                scale: hoveredId === product.id ? 1.02 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            className={`flex-shrink-0 w-64 md:w-72 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${hoveredId === product.id ? "ring-2 ring-primary/30" : ""
                                }`}
                        >
                            {/* Product Image */}
                            <div className="w-full h-48 md:h-56 bg-[#F5FBFB] flex items-center justify-center overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://placehold.co/300x200?text=Product";
                                    }}
                                />
                            </div>

                            {/* Product Details */}
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">
                                    {product.description}
                                </p>

                                {/* Price */}
                                <p className="text-lg font-bold text-gray-900 mb-2">
                                    INR {product.price.toLocaleString()}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex">{renderStars(product.rating)}</div>
                                    <span className="text-xs text-gray-500">
                                        {product.rating} | {product.reviews} Reviews
                                    </span>
                                </div>

                                {/* Shop Now Button */}
                                <button
                                    className="group flex items-center justify-between w-full px-4 py-2 rounded-full bg-white border border-gray-400 text-gray-500 transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
                                >
                                    <span className="text-sm font-medium">Shop now</span>
                                    <span
                                        className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white transition-all duration-300 rotate-[-45deg] group-hover:rotate-[135deg] group-hover:bg-white group-hover:text-teal-600"
                                    >
                                        ➜
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        className="group flex items-center justify-between w-[290px] px-4 py-2 rounded-full bg-white border border-gray-400 text-gray-500 transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
                    >
                        <span className="text-sm font-medium uppercase tracking-widest">
                            Explore All Products
                        </span>
                        <span
                            className="ml-4 flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 rotate-[-45deg] group-hover:rotate-[135deg] group-hover:bg-white group-hover:text-teal-600"
                        >
                            ➜
                        </span>
                    </button>

                    <button
                        className="group flex items-center justify-between w-[290px] px-4 py-2 rounded-full bg-white border border-gray-400 text-gray-500 transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
                    >
                        <span className="text-sm font-medium uppercase tracking-widest">
                            Shop by Trimester
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
