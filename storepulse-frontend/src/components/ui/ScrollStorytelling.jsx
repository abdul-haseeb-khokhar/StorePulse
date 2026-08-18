/**
 * ScrollStorytelling — landing page's 5-card "core platform benefits" row.
 */
import { motion } from "framer-motion";
import Card from "./Card";
import { Eyebrow } from "./Tag";
import { containerStagger, itemFadeUp, useReducedMotion } from "../../lib/motion";

const PROCESS_STEPS = [
  {
    step: "BENEFIT 01",
    title: "REAL-TIME",
    subtitle: "Live Visibility",
    image: "/homepage/store-pulse-realtime.png",
    fallbackImage: "/store-pulse-realtime.png",
    alt: "Real-Time Traffic Monitoring",
  },
  {
    step: "BENEFIT 02",
    title: "BEHAVIOR",
    subtitle: "Clicks & Views",
    image: "/homepage/store-pulse-behavior.png",
    fallbackImage: "/store-pulse-behavior.png",
    alt: "Visitor Behavior Analytics",
  },
  {
    step: "BENEFIT 03",
    title: "DASHBOARD",
    subtitle: "Unified Telemetry",
    image: "/homepage/store-pulse-dashboard.png",
    fallbackImage: "/store-pulse-dashboard.png",
    alt: "Store Pulse 3D Dashboard",
  },
  {
    step: "BENEFIT 04",
    title: "BETTER ROI",
    subtitle: "Revenue Growth",
    image: "/homepage/store-pulse-roi.png",
    fallbackImage: "/store-pulse-roi.png",
    alt: "Revenue & ROI Measurement",
  },
  {
    step: "BENEFIT 05",
    title: "INTEGRATION",
    subtitle: "Fast Integration",
    image: "/homepage/store-pulse-integration.png",
    fallbackImage: "/store-pulse-integration.png",
    alt: "Fast Ecommerce Integration",
  },
];

export default function ScrollStorytelling() {
  const reduceMotion = useReducedMotion();
  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  return (
    <section id="platform" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

      {/* Section Eyebrow & Title */}
      <motion.div {...reveal(itemFadeUp)} className="flex flex-col items-center text-center gap-1.5 mb-8 sm:mb-10 max-w-2xl mx-auto">
        <Eyebrow>CORE PLATFORM BENEFITS</Eyebrow>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          Everything your storefront needs to scale
        </h2>
      </motion.div>

      {/* 5-Column Benefit Card Row */}
      <motion.div
        {...reveal(containerStagger)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4"
      >
        {PROCESS_STEPS.map((item) => (
          <motion.div key={item.step} variants={reduceMotion ? undefined : itemFadeUp}>
            <Card
              interactive={false}
              className="h-full p-5 rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] cursor-default select-none flex flex-col items-center justify-between text-center gap-4 transition-all duration-300 shadow-sm group"
            >
              {/* Benefit Badge */}
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--muted)] opacity-80">
                {item.step}
              </span>

              {/* Centered 3D Image Asset Box */}
              <div className="w-full h-28 flex items-center justify-center py-1 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  onError={(e) => {
                    e.currentTarget.src = item.fallbackImage;
                  }}
                  className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-0.5 w-full">
                <h3 className="font-bold text-sm tracking-wider uppercase text-[var(--ink)] font-sora">
                  {item.title}
                </h3>
                <span className="text-xs text-[var(--muted)] font-medium">
                  {item.subtitle}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}
