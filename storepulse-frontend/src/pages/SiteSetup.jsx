import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CodeBlock from "../components/ui/CodeBlock";
import api, { API_BASE_URL, getApiErrorMessage } from "../lib/api";
import { CONTACT_GMAIL_URL, CONTACT_WHATSAPP, CONTACT_PHONE } from "../lib/contact";

export default function SiteSetup() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyLabel, setCopyLabel] = useState("Copy script");

  useEffect(() => {
    let ignore = false;

    async function loadSite() {
      try {
        const { data } = await api.get(`/sites/${siteId}`);
        if (!ignore) setSite(data.site);
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, "Could not load this site."));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSite();
    return () => {
      ignore = true;
    };
  }, [siteId]);

  const snippet = site
    ? `<script src="${API_BASE_URL}/track.js"\n  data-site-key="${site.apiKey}"></script>`
    : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy script"), 1600);
    } catch {
      // Clipboard access can fail (e.g. no permission); fail silently.
    }
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 640, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Site setup</h1>

        {loading ? (
          <Card>
            <p className="card-body">Loading…</p>
          </Card>
        ) : error && !site ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <Card elevation="md">
            <div className="card-kicker">{site.domain}</div>
            <div className="card-title">{site.name} is ready</div>
            <p className="card-body">This is your snippet.</p>
            <CodeBlock>{snippet}</CodeBlock>
            <div className="flex" style={{ gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              <Button variant="secondary" onClick={handleCopy}>
                {copyLabel}
              </Button>
              <Button onClick={() => navigate(`/dashboard?site=${site.id}`)}>
                Go to dashboard
              </Button>
            </div>
            <p className="card-body" style={{ marginTop: "var(--space-3)" }}>
              Need a hand with integration? Reach us however&apos;s easiest:
            </p>
            <div className="flex items-center" style={{ gap: "var(--space-4)" }}>
              <a
                href={CONTACT_GMAIL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm"
                style={{ gap: 6 }}
              >
                <Mail className="h-4 w-4 text-muted" />
                Email
              </a>
              <a
                href={`https://wa.me/${CONTACT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm"
                style={{ gap: 6 }}
              >
                <MessageCircle className="h-4 w-4 text-muted" />
                WhatsApp
              </a>
              <a href={`tel:+${CONTACT_PHONE}`} className="flex items-center text-sm" style={{ gap: 6 }}>
                <Phone className="h-4 w-4 text-muted" />
                Call
              </a>
            </div>
            <p className="card-body">
              If you&apos;re a developer (or have one), here&apos;s the{" "}
              <Link to="/docs">complete integration guide →</Link>.
            </p>
          </Card>
        )}

        {site && (
          <p className="text-sm" style={{ marginTop: "var(--space-3)" }}>
            Need to make changes later? <Link to={`/sites/${site.id}/settings`}>View site settings</Link>
          </p>
        )}
      </main>
    </AppLayout>
  );
}
