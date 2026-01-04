import { motion, AnimatePresence } from "framer-motion";
import { MotionCard } from "../../../../src/components/ui/motion_card";
import { CardContent } from "../../../../src/components/ui/card";
import { useState } from "react";

const cardsData = [
  {
    image: "./shefit/why-shefit-1.png",
    title: "Trimester-Tailored Support. Always On Time",
    description:
      "Flow, stretch, and breathe in ways designed specifically for where you are in your pregnancy journey",
  },
  {
    image: "./shefit/why-shefit-2.png",
    title: "Your Personalized Wellness, On Your Schedule",
    description:
      "Flexible, private sessions that adapt to your trimester, comfort level, and wellness goals.",
  },
  {
    image: "./shefit/why-shefit-3.png",
    title: "Rooted in Breath. United in Being.",
    description:
      "Use breathwork, music, and ancient wellness techniques to bond with your baby even before birth.",
  },
];


export const WhyChooseUsSection = () => {
  const [activeIndex, setActiveIndex] = useState<number>(2);

  return (
    <section className="w-full px-6 lg:px-[100px] py-24">
      <div className="flex flex-col gap-6 mb-16 px-[50px]">
        <h1 className="text-center text-[#333333] font-poppins font-[500] text-[42px] lg:text-[46px] leading-tight">From Overwhelmed to Empowered - Here's Why Moms Choose Us</h1>
        <p className="text-center font-poppins text-lg lg:text-xl leading-relaxed text-gray-600">Holistic sessions that restore confidence, calm the mind, and prepare you for birth and beyond.</p>
      </div>
      <motion.div layout className="flex w-full gap-6 items-stretch">
        {cardsData.map((card, index) => {
          const isActive = activeIndex === index;

          return (
            <MotionCard
              key={index}
              expandedFlex={3}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(2)}
             
              className="w-full bg-white border-0 rounded-[32px] shadow-sm"
            >
              <CardContent className="p-6 flex flex-col gap-6 ">

                <motion.div
                  layout
                  animate={{
                    height: isActive ? 468 : 573,

                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 110,
                    damping: 18,
                    delay: isActive ? 0 : 0,
                  }}
                  className={isActive ? "w-[720px] overflow-hidden rounded-2xl" : "w-[388px] h-70 overflow-hidden rounded-2xl"}
                >
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover object-center" draggable={false} />
                </motion.div>

                {/* TITLE */}
                <h3 className="font-poppins text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight text-black">
                  {card.title}
                </h3>

                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.35, ease: "easeOut", delay:0.08 }}
                      className="font-poppins text-[#333333] text-base sm:text-lg leading-relaxed"
                    >
                      {card.description}
                    </motion.p>
                  )}
                </AnimatePresence>

              </CardContent>
            </MotionCard>
          );
        })}
      </motion.div>
    </section>
  );
};