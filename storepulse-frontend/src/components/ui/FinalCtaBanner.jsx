import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import { itemFadeUp, useReducedMotion } from "../../lib/motion";

export default function FinalCtaBanner() {
  const reduceMotion = useReducedMotion();
  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <motion.div
        {...reveal(itemFadeUp)}
        className="rounded-3xl bg-[var(--paper-card)] border border-[var(--divider-soft)] p-8 sm:p-12 lg:p-16 flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden"
      >
        {/* Eyebrow Kicker */}
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#DDBB55]">
          START MONITORING TODAY
        </span>

        {/* Heading & Subtitle */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--ink)] max-w-3xl leading-tight font-sora">
          Ready to see what your shoppers are doing right now?
        </h2>
        
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl leading-relaxed">
          Join store owners scaling with StorePulse live telemetry. Free to start, no credit card required.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="md" className="shadow-md">
              Start Tracking Free
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="md">
              Sign In to Store
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
