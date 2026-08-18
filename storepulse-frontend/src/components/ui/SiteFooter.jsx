/**
 * SiteFooter — shared marketing/docs footer: brand block, section nav
 * links (overridable via `navItems`), and the NYRON credit line.
 */
import { Link } from "react-router-dom";
import { ContactLink } from "./ContactLink";

const NAV_ITEMS = [
  { name: "OVERVIEW", href: "/#story" },
  { name: "CAPABILITIES", href: "/#platform" },
  { name: "INTEGRATION", href: "/#integration" },
  { name: "PRICING", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "DOCS", href: "/docs" },
];

export default function SiteFooter({ navItems = null }) {
  const itemsToRender = navItems || NAV_ITEMS;

  return (
    <footer className="relative w-full bg-[var(--paper)] text-[var(--ink)] border-t border-[var(--divider-soft)] pt-8 pb-6 transition-colors duration-200 text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">

        {/* Main Footer Row — Logo + Tagline Left, Circular Icon Buttons Right */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--divider-soft)]">

          {/* Brand Info & Logos */}
          <div className="space-y-2 max-w-md">
            <Link to="/" aria-label="StorePulse Homepage" className="inline-block">
              {/* Light Theme Logo */}
              <img
                src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo2.png"
                alt="StorePulse"
                className="h-10 sm:h-11 w-auto object-contain logo-light"
              />
              {/* Dark Theme Logo */}
              <img
                src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo3.png"
                alt="StorePulse"
                className="h-10 sm:h-11 w-auto object-contain logo-dark"
              />
            </Link>
            <p className="font-sora text-xs sm:text-sm text-[var(--muted)] font-normal leading-relaxed">
              Real-time traffic monitoring, product telemetry, and conversion analytics built for modern ecommerce storefronts.
            </p>
          </div>

          {/* Contact CTA — routes to our company's contact page. A real
              labeled button now, not a bare icon-only circle: the old
              version relied entirely on a hover `title` tooltip, which
              never fires on touch devices. */}
          <div className="flex items-center space-x-3">
            <ContactLink />
          </div>

        </div>

        {/* Section Navigation Links Bar with Animated Underline */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-4 font-sora text-xs sm:text-sm border-b border-[var(--divider-soft)]">
          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            {itemsToRender.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group relative inline-flex items-center font-sora text-xs font-bold tracking-wider text-[var(--ink)] hover:text-[#DDBB55] transition-colors duration-150 py-0.5 cursor-pointer"
              >
                <span>{item.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#DDBB55] transition-all duration-200 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Copyright with NYRON External Link & Swapped Light/Dark Logos */}
        <div className="pt-4 flex items-center justify-between font-sora text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} StorePulse. A product of</span>
            <a
              href="https://nyron-x.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:opacity-85 transition-opacity"
              title="NYRON Digital Solutions"
            >
              {/* Swapped: NYRONDARK for light theme, NYRONLIGHT for dark theme */}
              <img
                src="/NYRONDARK.svg"
                alt="NYRON"
                className="h-3.5 w-auto object-contain logo-light inline-block"
              />
              <img
                src="/NYRONLIGHT.svg"
                alt="NYRON"
                className="h-3.5 w-auto object-contain logo-dark inline-block"
              />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
