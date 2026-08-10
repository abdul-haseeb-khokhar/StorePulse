import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Nav from "../components/ui/Nav";
import HeroSectionOne from "../components/ui/HeroSectionOne";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tag, { Eyebrow } from "../components/ui/Tag";
import HeroAnimation from "../components/ui/HeroAnimation";
import SiteFooter from "../components/ui/SiteFooter";
import { containerStagger, itemFadeUp, useReducedMotion } from "../lib/motion";

const FEATURES = [
  {
    kicker: "Traffic",
    title: "Daily visitors & trend",
    body: "A day-by-day read on page views and unique visitors, with the period-over-period change built in.",
  },
  {
    kicker: "Product clicks",
    title: "What shoppers touch",
    body: "Tag any element with a product id and see which products get clicked most, ranked automatically.",
  },
  {
    kicker: "Multi-site",
    title: "Every store, one place",
    body: "Add as many storefronts as you run. Switch between them from the same dashboard, each with its own key.",
  },
];

export default function Landing() {
  const reduceMotion = useReducedMotion();
  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Nav />

      {/* Primary Real-Time Intelligence Hero Section */}
      <HeroSectionOne />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col gap-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <Tag variant="outline" className="w-fit text-xs font-medium">
            Traffic monitoring for ecommerce
          </Tag>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--ink)]">
            See exactly how shoppers move through your store
          </h1>
        </div>

        <HeroAnimation />

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Link to="/signup">
            <Button size="lg">Start tracking free</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">I already have an account</Button>
          </Link>
        </div>
      </section>

      {/* Why StorePulse Section */}
      <section className="border-y border-[var(--divider)] bg-[var(--paper-card)]/40">
        <motion.div
          {...reveal(itemFadeUp)}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col gap-4"
        >
          <Eyebrow>Why StorePulse</Eyebrow>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--ink)] max-w-xl">
            You can&apos;t improve what you can&apos;t see.
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-3xl">
            StorePulse shows store owners exactly how visitors interact with their
            site — what gets clicked, what gets ignored, and where sales opportunities
            are slipping away — so decisions are based on real behavior, not guesswork.
          </p>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col gap-10">
        <motion.div {...reveal(itemFadeUp)} className="flex flex-col gap-2">
          <Eyebrow>Features</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            This is what StorePulse provides
          </h2>
        </motion.div>

        <motion.div
          {...reveal(containerStagger)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.kicker} variants={reduceMotion ? undefined : itemFadeUp}>
              <Card interactive className="h-full p-6">
                <div className="text-xs font-semibold tracking-widest uppercase text-[var(--stamp)] mb-2">
                  {feature.kicker}
                </div>
                <div className="text-lg font-bold text-[var(--ink)] mb-2">
                  {feature.title}
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {feature.body}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}

