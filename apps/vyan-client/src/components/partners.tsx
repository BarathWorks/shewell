"use client";
import React from "react";
import { motion } from "framer-motion";

const Partners = () => {
    const partners = [
        { name: "Startup India", logo: "/images/fundedby/funded1-active.png" },
        { name: "DST NIDHI", logo: "/images/fundedby/funded2-active.png" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
            },
        },
    };

    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="text-center text-3xl font-bold text-gray-800 tracking-wider mb-12"
                >
                    FUNDED BY
                </motion.h2>

                {/* Logo Container */}
                <motion.div
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {partners.map((partner, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.05,
                                y: -5,
                                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                            }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center w-64 h-32 cursor-pointer"
                        >
                            <motion.img
                                src={partner.logo}
                                alt={partner.name}
                                className="max-h-full max-w-full object-contain"
                                initial={{ filter: "grayscale(100%)" }}
                                whileHover={{ filter: "grayscale(0%)" }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Partners;

