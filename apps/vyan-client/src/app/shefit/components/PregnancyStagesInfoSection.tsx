import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "../../../../src/components/ui/card";
import { InteractiveButton } from "../../../../src/components/ui/interactive-button";

/* ---------------- DATA ---------------- */

const stagesData = [
  {
    title: "Second Trimester (13–27 Weeks)",
    description: [
      "Ease back pain, fatigue, and acidity",
      "Improve digestion and sleep",
      "Strengthen your body gently",
      "Stimulate baby's brain development",
      "Practice sound therapy & Garbh Sanskar",
    ],
    bgColor: "bg-[#B88BC6]",
    textColor: "text-white",
  },
  {
    title: "Third Trimester (28+ Weeks)",
    description: [
      "Prepare your body for labour & birth",
      "Improve mobility and balance",
      "Support baby movement & positioning",
    ],
    bgColor: "bg-[#BFDFA0]",
    textColor: "text-black",
  },
  {
    title: "Postnatal Recovery",
    description: [
      "Heal safely and rebuild core strength",
      "Reduce stress and improve mobility",
      "Gentle pace to physical recovery",
    ],
    bgColor: "bg-[#9ADBDC]",
    textColor: "text-black",
  },
];

/* ---------------- ANIMATIONS ---------------- */

const containerVariants = {
  inactive: {},
  active: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.08,
    },
  },
};

const titleVariants = {
  inactive: { y: 0 },
  active: {
    y: -56,
    transition: {
      duration: 0.45,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/* ---------------- COMPONENT ---------------- */

export const PregnancyStagesInfoSection = (): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="px-6 lg:px-[100px] py-24 w-full font-poppins">
      <div className="flex w-full h-[700px] overflow-hidden rounded-2xl">
        {stagesData.map((stage, index) => {
          const isActive = index === activeIndex;

          return (
            <motion.div
              key={index}
              layout
              onMouseEnter={() => setActiveIndex(index)}
              className="relative cursor-pointer"
              style={{ flexGrow: isActive ? 2.2 : 1 }}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                  mass: 0.8,
                },
              }}
            >
              <Card
                className={`h-full ${stage.bgColor} border-0 rounded-none overflow-hidden`}
              >
                <CardContent className="relative h-full p-10">
                  
                  {/* Icon */}
                  <motion.div
                    className="absolute top-6 right-6 z-20"
                    animate={{
                     
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <InteractiveButton active={isActive} />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    className="absolute bottom-10 left-10 right-10"
                    variants={containerVariants}
                    animate={isActive ? "active" : "inactive"}
                  >
                    {/* Title */}
                    <motion.h3
                      
                      className={`font-semibold ${stage.textColor} text-3xl lg:text-5xl leading-tight`}
                    >
                      {stage.title}
                    </motion.h3>

                    {/* Description */}
                    {isActive && (
                      <motion.ul
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                        className={`mt-6 space-y-2 list-disc pl-5 ${stage.textColor} text-lg`}
                      >
                        {stage.description.map((line, i) => (
                          <motion.li key={i} >
                            {line}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};