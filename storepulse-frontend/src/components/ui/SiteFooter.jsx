import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import {
  CONTACT_GMAIL_URL,
  CONTACT_WHATSAPP,
  CONTACT_PHONE,
} from "../../lib/contact";

const NAV_ITEMS = [
  { name: "OVERVIEW", href: "/#story" },
  { name: "CAPABILITIES", href: "/#platform" },
  { name: "INTEGRATION", href: "/#integration" },
  { name: "PRICING", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "DOCS", href: "/docs" },
];

function WhatsAppIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

export default function SiteFooter({ navItems = null }) {
  const itemsToRender = navItems || NAV_ITEMS;
  const isCustomNav = Boolean(navItems);

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

          {/* Circular Contact Icon Buttons (Email, Authentic WhatsApp SVG, Phone) */}
          <div className="flex items-center space-x-3">
            <a
              href={CONTACT_GMAIL_URL}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full border border-[var(--divider-soft)] bg-[var(--paper-card)] text-[var(--ink)] hover:border-[#DDBB55] hover:text-[#DDBB55] transition-colors cursor-pointer"
              aria-label="Email Us"
              title="Email Us"
            >
              <Mail className="h-4 w-4" />
            </a>

            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full border border-[var(--divider-soft)] bg-[var(--paper-card)] text-[var(--ink)] hover:border-[#DDBB55] hover:text-[#DDBB55] transition-colors cursor-pointer"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>

            <a
              href={`tel:+${CONTACT_PHONE}`}
              className="p-2.5 rounded-full border border-[var(--divider-soft)] bg-[var(--paper-card)] text-[var(--ink)] hover:border-[#DDBB55] hover:text-[#DDBB55] transition-colors cursor-pointer"
              aria-label="Call Us"
              title="Call Us"
            >
              <Phone className="h-4 w-4" />
            </a>
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
            
            {!isCustomNav && (
              <a
                href={CONTACT_GMAIL_URL}
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex items-center font-sora text-xs font-bold tracking-wider text-[var(--ink)] hover:text-[#DDBB55] transition-colors duration-150 py-0.5 cursor-pointer"
              >
                <span>CONTACT</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#DDBB55] transition-all duration-200 ease-out group-hover:w-full" />
              </a>
            )}
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
