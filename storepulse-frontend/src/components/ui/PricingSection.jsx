import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import { Eyebrow } from "./Tag";
import { PLANS } from "../../lib/landingData";
import { containerStagger, itemFadeUp, useReducedMotion } from "../../lib/motion";

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const reduceMotion = useReducedMotion();

  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col gap-12">
      
      {/* Header & Annual Toggle — Left-aligned */}
      <motion.div {...reveal(itemFadeUp)} className="flex flex-col items-start text-left gap-3 max-w-3xl">
        <Eyebrow>TRANSPARENT PRICING</Eyebrow>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Simple, predictable plans for stores of all sizes
        </h2>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
          Start for free, upgrade as your store grows. No hidden fees or surprise pageview charges.
        </p>

        {/* Monthly / Annual Billing Switcher */}
        <div className="mt-2 inline-flex items-center gap-3 p-1 rounded-full bg-[var(--paper-card)] border border-[var(--divider-soft)]">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !annual
                ? "bg-[var(--paper)] text-[var(--ink)] shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              annual
                ? "bg-[#DDBB55]/15 text-[#DDBB55] border border-[#DDBB55]/30 shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Annual Billing
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#DDBB55] text-[#000C1A] font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </motion.div>

      {/* 3 Pricing Cards Grid */}
      <motion.div
        {...reveal(containerStagger)}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2"
      >
        {PLANS.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          return (
            <motion.div key={plan.id} variants={reduceMotion ? undefined : itemFadeUp}>
              <Card
                interactive={false}
                className={`h-full p-6 sm:p-8 flex flex-col justify-between gap-8 rounded-2xl border transition-all duration-300 relative ${
                  plan.popular
                    ? "border-[#DDBB55] bg-[var(--paper-card)] shadow-xl"
                    : "border-[var(--divider-soft)] bg-[var(--paper-card)] shadow-sm"
                }`}
              >
                {/* Solid Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#DDBB55] text-[#000C1A] border-0 shadow-md whitespace-nowrap z-10">
                    Most Popular
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {/* Plan Name & Price */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-[var(--ink)]">{plan.name}</h3>
                    <p className="text-xs text-[var(--muted)] min-h-[32px] leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[var(--ink)] font-sora">
                        ${price}
                      </span>
                      <span className="text-xs text-[var(--muted)]">/month</span>
                      {annual && price > 0 && (
                        <span className="text-[10px] text-[var(--muted)] ml-1 font-medium">
                          (billed annually)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-4 border-t border-[var(--divider-soft)] flex flex-col gap-3">
                    <span className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
                      Included features:
                    </span>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[var(--muted)]">
                        <Check className="h-4 w-4 text-[#DDBB55] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signup CTA */}
                <Link to="/signup" className="w-full">
                  <Button
                    variant={plan.buttonVariant}
                    size="md"
                    className="w-full justify-center"
                  >
                    {plan.buttonText}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

              </Card>
            </motion.div>
          );
        })}
      </motion.div>

    </section>
  );
}
