"use client";
import React from "react";
import { motion } from "framer-motion";

const Partners = () => {
    const partners = [
        { name: "IIT Mandi", logo: "/images/trustees/iitmandi.webp" },
        { name: "DST NIDHI", logo: "/images/trustees/dstnidhi.webp" },
        { name: "Meit", logo: "/images/trustees/meit.webp" },
        { name: "BBCentre", logo: "/images/trustees/bbc-logo.webp" },
        { name: "Startup India", logo: "/images/trustees/startup.webp" },
    ];

    const duplicatedPartners = [...partners, ...partners];

    return (
        <section className="bg-white px-4 sm:px-6 md:px-12 lg:px-20 xl:px-48 py-6 sm:py-8 md:py-12 overflow-hidden">
            <div className="max-w-full px-0 text-center">
                <div className="mb-6 sm:mb-8 md:mb-12">
                    <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className=" mb-2 sm:mb-3 font-poppins text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl font-medium leading-tight text-[#333333]"
                >
                    Our Partners in Care
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="mx-auto text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-[24px] text-[#33333399] "
                >
                  Together, we empower motherhood with expertise.
                </motion.p>
                </div>
                

                {/* Logo Container - Infinite Scroll Wrapper */}
                <div className="relative w-full overflow-hidden mb-12 sm:mb-16 md:mb-[65px]" >

                    <div className="absolute left-0 top-0 h-full w-12 sm:w-16 md:w-24 lg:w-32 xl:w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />

                    <div className="absolute right-0 top-0 h-full w-12 sm:w-16 md:w-24 lg:w-32 xl:w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />


                    {/* The Moving Track */}
                    <motion.div
                        className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-8 w-max py-3 sm:py-4"
                        animate={{ x: ["20%", "-50%"] }}
                        transition={{
                            ease: "easeInOut", 
                            duration: 20,      
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    >
                        {duplicatedPartners.map((partner, index) => (
                            <div
                                key={index}
                                className="bg-white relative z-10 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-slate-200/80 flex items-center justify-center w-28 sm:w-32 md:w-40 lg:w-48 h-16 sm:h-20 md:h-24 lg:h-28 shadow-sm"
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="max-h-8 sm:max-h-10 md:max-h-14 lg:max-h-full max-w-full object-cover opacity-90 hover:opacity-100 transition-all duration-100"
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Partners;