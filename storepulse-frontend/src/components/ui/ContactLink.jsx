import { Mail, MessageCircle } from "lucide-react";
import { NYRON_CONTACT_URL, CONTACT_GMAIL_URL } from "../../lib/contact";

// Small NYRON monogram, swapped per theme the same way SiteFooter.jsx's
// "product of" credit already does (.logo-light/.logo-dark, index.css).
// Neither source export has a transparent canvas — both are opaque squares
// (verified by sampling rendered pixel alpha, not just eyeballing it):
// nyron-icon-dark.svg is a white square (rgb 254,254,254), nyron-icon-light.svg
// is a black/navy square (rgb 14,19,23). Deliberately assigned opposite the
// page's own background — dark theme gets the white square, light theme
// gets the black one — so the badge contrasts against the page instead of
// blending into it.
function NyronMark({ className = "h-4 w-4" }) {
  return (
    <>
      <img
        src="/nyron-icon-light.svg"
        alt=""
        aria-hidden="true"
        className={`${className} logo-light object-contain shrink-0`}
      />
      <img
        src="/nyron-icon-dark.svg"
        alt=""
        aria-hidden="true"
        className={`${className} logo-dark object-contain shrink-0`}
      />
    </>
  );
}

// The one shared treatment for every generic "need help / get in touch"
// touchpoint in the app (footer, SiteSetup, SiteSettings, Login's banned
// banner) — previously each of these was its own hand-rolled <a> with a
// slightly different style. `variant="button"` renders a real small
// button (not a bare inline text link, so it reads as an affordance
// rather than a footnote); `variant="inline"` keeps the lighter
// underline-link treatment for contexts that already have their own
// container styling (e.g. Login's colored alert box) where a bordered
// button would clash.
export function ContactLink({ label = "Contact Us", variant = "button", className = "" }) {
  if (variant === "inline") {
    return (
      <a
        href={NYRON_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 font-medium hover:underline ${className}`}
      >
        <NyronMark className="h-3.5 w-3.5" />
        {label}
      </a>
    );
  }

  return (
    <a
      href={NYRON_CONTACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-outline btn-sm ${className}`}
    >
      <NyronMark />
      {label}
    </a>
  );
}

// BillingPay's two-channel variant. WhatsApp and email here are
// StorePulse's own payment-verification channels, not NYRON's (see the
// comment on NYRON_CONTACT_URL in lib/contact.js — this is deliberately
// excluded from that generic routing), so these keep their own distinct
// icons rather than the NYRON mark. Shares ContactLink's chip styling so
// the two no longer look like they belong to different design systems.
export function ContactChannels({ whatsappUrl, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center ${className}`} style={{ gap: "var(--space-2)" }}>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      <a href={CONTACT_GMAIL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
        <Mail className="h-4 w-4" />
        Email
      </a>
    </div>
  );
}
