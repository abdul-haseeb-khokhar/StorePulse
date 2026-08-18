/**
 * FaqSection — landing page accordion over the static FAQ copy in
 * lib/landingData.js. One question open at a time.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Eyebrow } from "./Tag";
import { FAQS } from "../../lib/landingData";
import { containerStagger, itemFadeUp, useReducedMotion } from "../../lib/motion";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const reduceMotion = useReducedMotion();

  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col gap-10">

      {/* Header */}
      <motion.div {...reveal(itemFadeUp)} className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto">
        <Eyebrow>FREQUENTLY ASKED QUESTIONS</Eyebrow>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Everything you need to know about StorePulse
        </h2>
      </motion.div>

      {/* Accordion List */}
      <motion.div {...reveal(containerStagger)} className="max-w-3xl w-full mx-auto flex flex-col gap-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIdx === index;
          return (
            <motion.div key={index} variants={reduceMotion ? undefined : itemFadeUp}>
              <div className="rounded-xl border border-[var(--divider-soft)] bg-[var(--paper-card)] overflow-hidden transition-colors">

                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 font-semibold text-sm sm:text-base text-[var(--ink)] hover:text-[#DDBB55] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--muted)] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#DDBB55]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-xs sm:text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--divider-soft)] pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </section>
  );
}
