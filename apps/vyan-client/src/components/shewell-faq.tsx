"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeader from "./section-header";

const FAQ_CONTENT = [
  {
    question: "What is Shewell and who is it for?",
    answer:
      "Shewell is a one-stop digital wellness platform offering expert-led care for women through all stages—from fertility to postpartum. It's designed for moms-to-be, new mothers, and caregivers seeking holistic support.",
  },
  {
    question: "Are the sessions suitable for all stages of pregnancy?",
    answer:
      "Yes! Our programs are designed trimester-wise, so whether you're in your first or third trimester, you'll receive the right support for your stage.",
  },
  {
    question: "What is SheFit and how does it work?",
    answer:
      "SheFit is our trimester-based prenatal yoga and breathwork program. Each session is tailored to your energy, physical needs, and comfort level.",
  },
  {
    question: "Can I book private 1-on-1 yoga sessions?",
    answer:
      "Absolutely! We offer personalized sessions that adapt to your schedule and specific body needs—whether for pregnancy, recovery, or relaxation.",
  },
];

/**
 * FAQ.
 *
 * One behavioural addition, deliberately: an answer could previously *only* be
 * revealed by `onMouseEnter`. There is no hover on a touch screen and no hover
 * from a keyboard, so on a phone — and for anyone navigating by keyboard — the
 * answers were unreachable. Hover still opens an item exactly as before; clicking
 * or pressing Enter/Space now does too, and the state is exposed to assistive
 * technology through `aria-expanded` / `aria-controls`.
 *
 * Everything else is presentational: the open panel was solid `#00898F` with
 * white body text, which turned each answer into a saturated teal slab. Open
 * items now read as a bordered white card with normal body text, which is both
 * calmer and considerably easier to read at length.
 *
 * The unused `activeTab` state and `tabs` array behind the commented-out pill
 * navigation are gone; nothing rendered them.
 */
const ShewellFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-y bg-canvas">
      <div className="container-page">
        <SectionHeader
          eyebrow="Questions"
          title="Something on Your Mind? Let's Talk."
          lead="No matter where you are — questions, doubts or curiosity — we're here to listen and help."
        />

        <div className="mx-auto mt-10 max-w-3xl space-y-3 md:mt-14">
          {FAQ_CONTENT.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={index}
                onMouseEnter={() => setOpenIndex(index)}
                onMouseLeave={() => setOpenIndex(null)}
                className={[
                  "surface-card overflow-hidden transition-colors duration-200",
                  isOpen ? "border-primary-200" : "",
                ].join(" ")}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-primary-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50 sm:px-6 sm:py-5"
                  >
                    <span
                      className={[
                        "text-[15px] font-medium leading-snug transition-colors duration-200 sm:text-base",
                        isOpen ? "text-primary-800" : "text-ink",
                      ].join(" ")}
                    >
                      {item.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className={[
                        "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isOpen
                          ? "rotate-45 border-primary-500 bg-primary-500 text-white"
                          : "border-hairline-strong bg-surface text-primary-600",
                      ].join(" ")}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-hairline px-5 py-4 text-sm leading-relaxed text-body sm:px-6 sm:py-5 sm:text-[15px]">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShewellFAQ;
