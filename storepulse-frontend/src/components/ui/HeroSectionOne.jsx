import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MousePointerClick,
  Users,
  Eye,
  TrendingUp,
  ExternalLink,
  Globe,
} from "lucide-react";
import Button from "./Button";
import { Eyebrow } from "./Tag";
import { useReducedMotion } from "../../lib/motion";

const TOP_PRODUCTS = [
  { name: "Nike Air Max", clicks: "1,240", share: "32%" },
  { name: "Adidas Ultraboost", clicks: "980", share: "25%" },
  { name: "Puma Runner", clicks: "640", share: "16%" },
];

const TOP_REFERRERS = [
  { source: "Google Search", percent: "48%" },
  { source: "Direct Traffic", percent: "26%" },
  { source: "Social / Meta", percent: "18%" },
];

export default function HeroSectionOne() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--paper)] text-[var(--ink)] py-6 lg:py-10 lg:max-h-[90vh] flex items-center">
      {/* Background Decorative Glow — Minimal & Soft */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[350px] w-[350px] rounded-full bg-[#DDBB55]/10 dark:bg-[#DDBB55]/5 blur-[110px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

          {/* Left Column — Concise & Minimal Marketing Content */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col gap-4"
          >
            {/* Eyebrow / Badge */}
            <Eyebrow>
              REAL-TIME WEBSITE INTELLIGENCE
            </Eyebrow>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.12] text-[var(--ink)]">
              Know What Your Visitors Do <span className="text-[#DDBB55]">In Real Time.</span>
            </h1>

            {/* Minimal Paragraph */}
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-md">
              Track visitors, page views, and product clicks across your storefront as they happen.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Link to="/signup">
                <Button size="md" className="shadow-md">
                  Start Monitoring Free
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" size="md">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Integration Line with Pure SVG Icons & etc. */}
            <div className="pt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">Works with:</span>
              <div className="flex items-center gap-3">
                <img src="/shopify.svg" alt="Shopify" title="Shopify" className="h-4.5 w-4.5 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all" />
                <img src="/reactjs.svg" alt="React" title="React" className="h-4.5 w-4.5 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all" />
                <img src="/woocommerce.svg" alt="WooCommerce" title="WooCommerce" className="h-4.5 w-4.5 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all" />
                <img src="/wordpress.svg" alt="WordPress" title="WordPress" className="h-4.5 w-4.5 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all" />
                <img src="/nextjs.svg" alt="Next.js" title="Next.js" className="h-4.5 w-4.5 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all text-[var(--ink)]" />
              </div>
            </div>
          </motion.div>

          {/* Right Column — Compact, Sleek Single Yellow Line Dashboard */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-6 flex justify-end"
          >
            <div className="max-w-[560px] w-full rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] p-4 sm:p-5 shadow-xl flex flex-col gap-3.5">

              {/* Dashboard Top Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--divider-soft)]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-1.5 font-mono text-[11px] text-[var(--muted)] bg-[var(--paper)] px-2 py-0.5 rounded border border-[var(--divider-soft)]">
                    storepulse.io/live
                  </span>
                </div>
                {/* <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DDBB55]/15 text-[#DDBB55] border border-[#DDBB55]/30">
                  <span className="h-2 w-2 rounded-full bg-[#DDBB55] animate-live-pulse" />
                  <span>Live</span>
                </div> */}
              </div>

              {/* 3 Main Top Metric Tiles */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--divider-soft)] flex flex-col gap-0.5">
                  <div className="text-[10px] font-semibold text-[var(--muted)] flex items-center justify-between">
                    <span>Page Views</span>
                    <Eye className="h-3 w-3 text-[#DDBB55]" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[var(--ink)] font-sora">
                    24,890
                  </div>
                  <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> +22%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--divider-soft)] flex flex-col gap-0.5">
                  <div className="text-[10px] font-semibold text-[var(--muted)] flex items-center justify-between">
                    <span>Product Clicks</span>
                    <MousePointerClick className="h-3 w-3 text-[#DDBB55]" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[var(--ink)] font-sora">
                    3,840
                  </div>
                  <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> +18%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--divider-soft)] flex flex-col gap-0.5">
                  <div className="text-[10px] font-semibold text-[var(--muted)] flex items-center justify-between">
                    <span>Unique Visitors</span>
                    <Users className="h-3 w-3 text-[#DDBB55]" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[var(--ink)] font-sora">
                    1,280
                  </div>
                  <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> +14%
                  </div>
                </div>
              </div>

              {/* Chart: Smooth Crisp Golden Yellow Line */}
              <div className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--divider-soft)] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--ink)]">
                    Page Views & Product Clicks
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink)] font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#DDBB55]" /> Page Views
                  </div>
                </div>

                {/* Ultra-Smooth Aesthetic SVG Curve */}
                <div className="h-14 w-full relative">
                  <svg className="h-full w-full" viewBox="0 0 400 70" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ultraYellowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DDBB55" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#DDBB55" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill */}
                    <path
                      d="M 0,50 C 50,20 100,55 150,30 C 200,10 250,45 300,20 C 340,8 370,12 400,15 L 400,70 L 0,70 Z"
                      fill="url(#ultraYellowGradient)"
                    />
                    {/* Thin Crisp Golden Yellow Curve (strokeWidth 1.8px) */}
                    <path
                      d="M 0,50 C 50,20 100,55 150,30 C 200,10 250,45 300,20 C 340,8 370,12 400,15"
                      fill="none"
                      stroke="#DDBB55"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    {/* Active Pulse End Point */}
                    <circle cx="400" cy="15" r="3" fill="#DDBB55" />
                  </svg>
                </div>
              </div>

              {/* 2 Grid Columns: Top Clicked Products & Top Referrers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                {/* Top Clicked Products */}
                <div className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--divider-soft)] flex flex-col gap-2 text-xs">
                  <div className="font-semibold text-[var(--ink)] pb-1 border-b border-[var(--divider-soft)] flex items-center justify-between">
                    <span>Top Clicked Products</span>
                    <ExternalLink className="h-3 w-3 text-[var(--muted)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {TOP_PRODUCTS.map((prod) => (
                      <div key={prod.name} className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[var(--ink)] truncate max-w-[120px]">{prod.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[var(--ink)]">{prod.clicks}</span>
                          <span className="text-[10px] text-[var(--muted)] bg-[var(--paper-card)] px-1.5 py-0.5 rounded border border-[var(--divider-soft)]">{prod.share}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Referrers */}
                <div className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--divider-soft)] flex flex-col gap-2 text-xs">
                  <div className="font-semibold text-[var(--ink)] pb-1 border-b border-[var(--divider-soft)] flex items-center justify-between">
                    <span>Top Referrers</span>
                    <Globe className="h-3 w-3 text-[var(--muted)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {TOP_REFERRERS.map((ref) => (
                      <div key={ref.source} className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--muted)]">{ref.source}</span>
                        <span className="font-bold text-[var(--ink)]">{ref.percent}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
