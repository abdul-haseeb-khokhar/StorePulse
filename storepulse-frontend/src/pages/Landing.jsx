import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Nav from "../components/ui/Nav";
import HeroSectionOne from "../components/ui/HeroSectionOne";
import Button from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Tag";
import HeroAnimation from "../components/ui/HeroAnimation";
import ScrollStorytelling from "../components/ui/ScrollStorytelling";
import FastIntegrationSection from "../components/ui/FastIntegrationSection";
import PricingSection from "../components/ui/PricingSection";
import FaqSection from "../components/ui/FaqSection";
import FinalCtaBanner from "../components/ui/FinalCtaBanner";
import SiteFooter from "../components/ui/SiteFooter";
import { itemFadeUp, useReducedMotion } from "../lib/motion";

export default function Landing() {
  const reduceMotion = useReducedMotion();
  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Nav />

      {/* Primary Real-Time Intelligence Hero Section */}
      <HeroSectionOne />

      {/* Hero Animation Storyboard Section */}
      <motion.section
        id="story"
        {...reveal(itemFadeUp)}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2 max-w-3xl">
          <Eyebrow>TRAFFIC MONITORING FOR ECOMMERCE</Eyebrow>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-[1.15] text-[var(--ink)]">
            See exactly how shoppers move through your store
          </h2>
        </div>

        <HeroAnimation />

        <div className="flex flex-wrap items-center gap-3 mt-1">
          <Link to="/signup">
            <Button size="md">Start tracking free</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="md">I already have an account</Button>
          </Link>
        </div>
      </motion.section>

      {/* Core Platform Benefits Section */}
      <ScrollStorytelling />

      {/* Fast 2-Minute Script Integration Section */}
      <FastIntegrationSection />

      {/* Transparent Pricing & Plans Section */}
      <PricingSection />

      {/* Expandable Accordion FAQ Section */}
      <FaqSection />

      {/* Final End-of-Page Signup CTA Banner */}
      <FinalCtaBanner />

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}
