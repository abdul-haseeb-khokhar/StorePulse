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
 * SiteFooter — shared by every public page (Landing, Docs). Three
 * columns: brand, product links, and contact — the one place contact
 * info lives regardless of which public page someone landed on.
 */
export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--divider)" }}>
      <div
        className="mx-auto grid grid-cols-1 sm:grid-cols-3"
        style={{ maxWidth: 1040, gap: "var(--space-6)", padding: "var(--space-6) var(--space-4)" }}
      >
        <div>
          <div className="nav-brand" style={{ marginBottom: "var(--space-2)" }}>
            StorePulse
          </div>
          <p className="text-sm" style={{ opacity: 0.7, margin: 0, maxWidth: "28ch" }}>
            Traffic monitoring built for store owners, not analytics teams.
          </p>
        </div>

        <div>
          <div className="card-kicker" style={{ marginBottom: "var(--space-2)" }}>
            Product
          </div>
          <div className="grid" style={{ gap: "var(--space-2)" }}>
            <Link to="/docs" className="text-sm">
              Docs
            </Link>
          </div>
        </div>

        <div id="contact">
          <div className="card-kicker" style={{ marginBottom: "var(--space-2)" }}>
            Contact
          </div>
          <div className="grid" style={{ gap: "var(--space-2)" }}>
            <a
              href={CONTACT_GMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm"
              style={{ gap: 6 }}
            >
              <Mail className="h-4 w-4 text-muted" />
              {CONTACT_EMAIL}
            </a>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm"
              style={{ gap: 6 }}
            >
              <MessageCircle className="h-4 w-4 text-muted" />
              {CONTACT_WHATSAPP_DISPLAY}
            </a>
            <a href={`tel:+${CONTACT_PHONE}`} className="flex items-center text-sm" style={{ gap: 6 }}>
              <Phone className="h-4 w-4 text-muted" />
              {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
