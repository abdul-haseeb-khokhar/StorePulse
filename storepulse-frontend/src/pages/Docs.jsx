import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Nav from "../components/ui/Nav";
import CodeBlock from "../components/ui/CodeBlock";
import SiteFooter from "../components/ui/SiteFooter";
import { Eyebrow } from "../components/ui/Tag";
import {
  DOC_SECTIONS,
  SCRIPT_SNIPPET,
  SITE_KEY_EXAMPLE,
  PRODUCT_CARD_SNIPPET,
  PRODUCT_GRID_SNIPPET,
  REACT_SNIPPET,
  LIQUID_SNIPPET,
  PAGE_VIEW_PAYLOAD,
  PRODUCT_CLICK_PAYLOAD,
  TROUBLESHOOTING,
} from "../lib/docsData";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("get-site-key");
  const navScrollRef = useRef(null);

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -50% 0px" }
    );

    DOC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollNav = (direction) => {
    if (navScrollRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      navScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] transition-colors duration-200">
      <Nav />

      {/* Header Banner */}
      <div className="border-b border-[var(--divider-soft)] bg-[var(--paper)] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center space-x-2 mb-2">
            <Eyebrow>DEVELOPER DOCUMENTATION</Eyebrow>
          </div>
          <h1 className="font-sora text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--ink)] mb-2">
            StorePulse Integration Guide
          </h1>
          <p className="font-sora text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Everything you need to integrate StorePulse live traffic monitoring and product click telemetry into your store.
          </p>
        </div>
      </div>

      {/* Mobile Sticky Section Selector with Left & Right Arrow Buttons (No Scrollbar) */}
      <div className="lg:hidden sticky top-20 z-30 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--divider-soft)] py-2.5 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-2">

          <button
            type="button"
            onClick={() => scrollNav("left")}
            className="h-8 w-8 rounded-full border border-[var(--divider-soft)] bg-[var(--paper-card)] text-[var(--ink)] flex items-center justify-center shrink-0 hover:border-[#DDBB55] transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={navScrollRef}
            className="flex-1 overflow-x-auto flex items-center gap-2 no-scrollbar scroll-smooth py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {DOC_SECTIONS.map(({ id, title }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeSection === id
                  ? "bg-[#DDBB55] text-[#000C1A] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--paper-card)] border border-[var(--divider-soft)]"
                  }`}
              >
                {title}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollNav("right")}
            className="h-8 w-8 rounded-full border border-[var(--divider-soft)] bg-[var(--paper-card)] text-[var(--ink)] flex items-center justify-center shrink-0 hover:border-[#DDBB55] transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* Main Content Layout — Desktop Sticky Sidebar Left + Documentation Content Right */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">

          {/* Sticky Table of Contents — Desktop Left Sidebar (Clearance below sticky header) */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-28">
              <div className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--paper-card)] overflow-hidden shadow-sm">

                <div className="px-4 py-3 border-b border-[var(--divider-soft)] bg-[var(--paper)]">
                  <p className="font-sora text-[10px] font-bold tracking-widest uppercase text-[#DDBB55]">
                    Table of Contents
                  </p>
                </div>

                <nav className="flex flex-col p-2 gap-1">
                  {DOC_SECTIONS.map(({ id, title }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className={`text-left font-sora text-xs py-2 px-3 rounded-xl transition-all duration-150 cursor-pointer leading-snug ${activeSection === id
                        ? "bg-[#DDBB55] text-[#000C1A] font-bold shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] font-medium"
                        }`}
                    >
                      {title}
                    </button>
                  ))}
                </nav>

              </div>
            </div>
          </aside>

          {/* Main Documentation Body (With scroll-mt-32 clearance) */}
          <main className="flex-1 min-w-0">
            <div className="space-y-12 font-sora text-sm leading-relaxed text-[var(--muted)]">

              {/* 1. Get Your Site Key */}
              <section id="get-site-key" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  1. Get Your Site Key
                </h2>
                <p className="mb-3">
                  Before adding the script to your store, you need your unique site key. Each store registered in your StorePulse account gets its own key.
                </p>
                <div className="mt-3 p-3.5 rounded-xl border border-[var(--divider-soft)] bg-[var(--paper-card)] flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[var(--ink)]">Sample Site Key Format:</span>
                  <CodeBlock code={SITE_KEY_EXAMPLE} language="text" />
                </div>
              </section>

              {/* 2. Install the Tracking Script */}
              <section id="install-script" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  2. Install the Tracking Script
                </h2>
                <p className="mb-3">
                  Add the tracking script tag to your site’s HTML template. Place it inside the <code className="text-[#DDBB55] font-mono">&lt;head&gt;</code> element or right before the closing <code className="text-[#DDBB55] font-mono">&lt;/body&gt;</code> tag on every page you want to track.
                </p>
                <CodeBlock code={SCRIPT_SNIPPET} language="html" />
              </section>

              {/* 3. How Page View Tracking Works */}
              <section id="page-view-tracking" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  3. How Page View Tracking Works
                </h2>
                <p className="mb-3">
                  Once installed, the script automatically tracks page views when a page loads. It captures the current URL, referrer, and an anonymous visitor ID stored in <code className="text-[#DDBB55] font-mono">localStorage</code>.
                </p>
                <p>
                  For Single Page Applications (SPAs) like React or Next.js, the script listens to URL pushState changes and reports virtual pageviews automatically.
                </p>
              </section>

              {/* 4. Tracking Product Clicks */}
              <section id="product-click-tracking" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  4. Tracking Product Clicks
                </h2>
                <p className="mb-4">
                  To track when visitors click on specific product cards or buy buttons, add custom <code className="text-[#DDBB55] font-mono">data-storepulse-*</code> attributes to your HTML markup:
                </p>

                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-[var(--ink)] mb-1.5 block">Single Product Card:</span>
                    <CodeBlock code={PRODUCT_CARD_SNIPPET} language="html" />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[var(--ink)] mb-1.5 block">Product Grid List:</span>
                    <CodeBlock code={PRODUCT_GRID_SNIPPET} language="html" />
                  </div>
                </div>
              </section>

              {/* 5. Framework-Specific Notes */}
              <section id="framework-notes" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  5. Framework-Specific Notes
                </h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-[var(--ink)] mb-1.5">React / Next.js</h3>
                    <CodeBlock code={REACT_SNIPPET} language="javascript" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--ink)] mb-1.5">Shopify Liquid Templates</h3>
                    <CodeBlock code={LIQUID_SNIPPET} language="html" />
                  </div>
                </div>
              </section>

              {/* 6. Verifying Your Integration */}
              <section id="verify-integration" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  6. Verifying Your Integration
                </h2>
                <p className="mb-3">
                  Open your browser’s Developer Tools and look at the Network tab. Filter by <code className="text-[#DDBB55] font-mono">events</code> to see live HTTP POST payloads being sent to StorePulse.
                </p>
                <p>
                  You will see an immediate entry in your StorePulse real-time dashboard feed.
                </p>
              </section>

              {/* 7. Troubleshooting */}
              <section id="troubleshooting" className="scroll-mt-32 sm:scroll-mt-36 border-b border-[var(--divider-soft)] pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  7. Troubleshooting & Gotchas
                </h2>
                <div className="space-y-3">
                  {TROUBLESHOOTING.map(({ symptom, cause }, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[var(--divider-soft)] bg-[var(--paper-card)]">
                      <p className="font-semibold text-[var(--ink)] text-xs mb-1">{symptom}</p>
                      <p className="text-xs text-[var(--muted)]">{cause}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 8. Event Payloads */}
              <section id="event-payloads" className="scroll-mt-32 sm:scroll-mt-36">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-3 font-sora">
                  8. Data Sent per Event
                </h2>
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-[var(--ink)] mb-1.5 block">PAGE_VIEW Payload:</span>
                    <CodeBlock code={PAGE_VIEW_PAYLOAD} language="json" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--ink)] mb-1.5 block">PRODUCT_CLICK Payload:</span>
                    <CodeBlock code={PRODUCT_CLICK_PAYLOAD} language="json" />
                  </div>
                </div>
              </section>

            </div>
          </main>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
