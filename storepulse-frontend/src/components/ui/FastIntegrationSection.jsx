import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, ArrowRight } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { Eyebrow } from "./Tag";
import { containerStagger, itemFadeUp, useReducedMotion } from "../../lib/motion";

// Deliberately NOT the real API_BASE_URL — this section renders on the
// public landing page, visible to anyone including logged-out visitors, so
// the actual backend host has no business appearing here. Signed-in users
// get their real working snippet (real host + real site key) on their own
// site's setup/settings page instead.
const PUBLIC_SNIPPET_ORIGIN = "https://track.storepulse.io";

const SNIPPETS = [
  {
    id: "html",
    label: "HTML / Universal",
    code: `<!-- Add to <head> of your storefront -->\n<script src="${PUBLIC_SNIPPET_ORIGIN}/track.js"\n  data-site-key="sp_live_your_site_key_here"></script>`,
  },
  {
    id: "product",
    label: "Product Click Tagging",
    code: `<!-- Tag any element to track product engagement -->\n<div class="product-card"\n     data-storepulse-product-id="prod_123"\n     data-storepulse-product-name="Blue Ceramic Mug">\n  <img src="mug.jpg" alt="Blue Ceramic Mug" />\n  <button>Add to Cart</button>\n</div>`,
  },
  {
    id: "react",
    label: "React / Next.js",
    code: `// Add to App.js or Next.js _document.js\n<script\n  src="${PUBLIC_SNIPPET_ORIGIN}/track.js"\n  data-site-key="sp_live_your_site_key_here"\n  async\n/>`,
  },
];

export default function FastIntegrationSection() {
  const [activeTab, setActiveTab] = useState("html");
  const reduceMotion = useReducedMotion();

  const reveal = (variants) =>
    reduceMotion ? {} : { variants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" } };

  const currentSnippet = SNIPPETS.find((s) => s.id === activeTab);

  return (
    <section id="integration" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col gap-8">
      
      {/* Header */}
      <motion.div {...reveal(itemFadeUp)} className="flex flex-col gap-2 max-w-4xl">
        <Eyebrow>FAST INTEGRATION</Eyebrow>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--ink)]">
          Paste one line of code. Start tracking immediately.
        </h2>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Zero complex analytics SDKs. StorePulse tracks live page views and product engagement out of the box.
        </p>
      </motion.div>

      {/* Code Snippet Showcase Card */}
      <motion.div {...reveal(containerStagger)} className="max-w-4xl w-full mx-auto">
        <div className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] shadow-sm overflow-hidden">
          
          {/* Header Bar with Tabs */}
          <div className="px-3 sm:px-4 py-2.5 bg-[var(--paper)] border-b border-[var(--divider-soft)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Code2 className="h-4 w-4 text-[#DDBB55] shrink-0 mr-1 hidden sm:block" />
            {SNIPPETS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#DDBB55]/15 text-[#DDBB55] border border-[#DDBB55]/30 font-semibold shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Snippet Code Area */}
          <div className="p-3.5 sm:p-5 bg-[var(--paper-card)] overflow-x-auto">
            <CodeBlock className="text-xs sm:text-sm text-[var(--ink)] border-0 bg-transparent p-0 whitespace-pre">
              {currentSnippet?.code}
            </CodeBlock>
          </div>

          {/* Footer Bar with SVG Icons */}
          <div className="px-4 sm:px-6 py-3 bg-[var(--paper)] border-t border-[var(--divider-soft)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">Works with:</span>
              <div className="flex items-center gap-3">
                <img src="/wordpress.svg" alt="WordPress" title="WordPress" className="h-4.5 w-4.5 object-contain opacity-85 hover:opacity-100 transition-opacity" />
                <img src="/nextjs.svg" alt="Next.js" title="Next.js" className="h-4.5 w-4.5 object-contain opacity-85 hover:opacity-100 transition-opacity text-[var(--ink)]" />
                <img src="/reactjs.svg" alt="React" title="React" className="h-4.5 w-4.5 object-contain opacity-85 hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <Link
              to="/docs"
              className="inline-flex items-center gap-1 font-medium text-[var(--ink)] hover:text-[#DDBB55] transition-colors"
            >
              Read full documentation
              <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)]" />
            </Link>
          </div>

        </div>
      </motion.div>

    </section>
  );
}
