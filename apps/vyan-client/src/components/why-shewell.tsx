"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ShieldCheck, Users, Banknote, Award } from "lucide-react";
import Image from "next/image";

const WHY_SHEWELL_DATA = [
    {
        id: 1,
        title: "India's Leading Digital Wellness Hub for Women & Children",
        description:
            "Trusted by moms and experts alike, providing a safe space for postpartum and maternal care.",
        icon: <Users className="w-6 h-6" />,
    },
    {
        id: 2,
        title: "Most affordable virtual health services.",
        description:
            "Expert sessions, holistic care, and evidence-based guidance—without the premium price tag.",
        icon: <Banknote className="w-6 h-6" />,
    },
    {
        id: 3,
        title: "Data-Protected, Globally Certified",
        description:
            "Secure, HIPAA, and GDPR compliant systems for your peace of mind.",
        icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
        id: 4,
        title: "Across Borders, Across Cultures",
        description:
            "Clients from 110+ countries served with care that respects cultural nuances.",
        icon: <Globe className="w-6 h-6" />,
    },
    {
        id: 5,
        title: "World-Class Experts, One Click Away",
        description:
            "Certified professionals specializing in nutrition, mental health, and pediatric care.",
        icon: <Award className="w-6 h-6" />,
    },
];

const WhyShewell = () => {
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    return (
        <section className="bg-[#F5F5F5] py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch h-full">
                {/* Left Image Section */}
                <div className="w-full lg:w-[50%] relative rounded-3xl overflow-hidden shadow-lg h-[500px] lg:h-[500px]">
                    <Image
                        src="/home/why-shewell.png"
                        alt="Why Shewell"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </div>

                {/* Right List */}
                <div className="w-full lg:w-[60%] flex flex-col justify-between gap-3">
                    {WHY_SHEWELL_DATA.map((item) => (
                        <motion.div
                            key={item.id}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`rounded-2xl md:rounded-3xl shadow-sm border transition-all duration-300 p-4 flex items-center gap-4 cursor-pointer ${
                                hoveredId === item.id
                                    ? "bg-[#007D79] border-[#007D79] shadow-lg"
                                    : "bg-white border-transparent hover:shadow-md"
                            }`}
                        >
                            {/* Icon Circle */}
                            <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                hoveredId === item.id
                                    ? "bg-white text-[#007D79]"
                                    : "bg-[#E0F2F1] text-[#007D79]"
                            }`}>
                                {item.icon}
                            </div>

                            <div className="flex-1">
                                <h3 className={`text-base md:text-lg font-medium transition-colors duration-300 ${
                                    hoveredId === item.id ? "text-white" : "text-[#4A4A4A]"
                                }`}>
                                    {item.title}
                                </h3>
                                {/* Description shows on hover */}
                                {hoveredId === item.id && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-white/90 text-sm mt-2 leading-relaxed"
                                    >
                                        {item.description}
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyShewell;
