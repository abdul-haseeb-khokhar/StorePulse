import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import {
  CONTACT_GMAIL_URL,
  CONTACT_EMAIL,
  CONTACT_WHATSAPP,
  CONTACT_WHATSAPP_DISPLAY,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
} from "../../lib/contact";

/**
 * SiteFooter — shared by public pages (Landing, Docs). Three-column
 * layout adhering to NYRON container guidelines and typography rules.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--divider)] bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="nav-brand text-lg font-bold mb-3 color-[var(--ink)]">
            StorePulse
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-xs">
            Traffic monitoring built for store owners, not analytics teams.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-[var(--stamp)] mb-3">
            Product
          </div>
          <div className="flex flex-col gap-2.5">
            <Link to="/docs" className="text-xs sm:text-sm font-medium hover:text-[var(--stamp)] transition-colors">
              Docs
            </Link>
          </div>
        </div>

        <div id="contact">
          <div className="text-xs font-semibold tracking-widest uppercase text-[var(--stamp)] mb-3">
            Contact
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={CONTACT_GMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium hover:text-[var(--stamp)] transition-colors"
            >
              <Mail className="h-4 w-4 text-[var(--muted)] shrink-0" />
              <span>{CONTACT_EMAIL}</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium hover:text-[var(--stamp)] transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[var(--muted)] shrink-0" />
              <span>{CONTACT_WHATSAPP_DISPLAY}</span>
            </a>
            <a
              href={`tel:+${CONTACT_PHONE}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium hover:text-[var(--stamp)] transition-colors"
            >
              <Phone className="h-4 w-4 text-[var(--muted)] shrink-0" />
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--divider-soft)] py-6 text-center text-xs text-[var(--muted)] font-sora">
        &copy; {new Date().getFullYear()} StorePulse. Built with precision.
      </div>
    </footer>
  );
}

