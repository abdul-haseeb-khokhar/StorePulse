import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import CodeBlock from "../components/ui/CodeBlock";
import api, { API_BASE_URL, getApiErrorMessage } from "../lib/api";
import { CONTACT_GMAIL_URL, CONTACT_WHATSAPP, CONTACT_PHONE } from "../lib/contact";

export default function SiteSettings() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showRegenNotice, setShowRegenNotice] = useState(false);

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

  async function handleRegenerate() {
    setError(null);
    setRegenerating(true);
    try {
      const { data } = await api.patch(`/sites/${siteId}/api-key`);
      setSite(data.site);
      setShowRegenNotice(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate the API key."));
    } finally {
      setRegenerating(false);
      setConfirmOpen(false);
    }
  }

  const snippet = site
    ? `<script src="${API_BASE_URL}/track.js"\n  data-site-key="${site.apiKey}"></script>`
    : "";

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Site settings</h1>

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
          <>
            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">{site.domain}</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                {site.name}
              </div>
              <div className="grid" style={{ gap: "var(--space-3)" }}>
                <Field id="st-name" label="Site name" value={site.name} readOnly />
                <Field id="st-domain" label="Domain" value={site.domain} readOnly />
                <Field
                  id="st-key"
                  label="API key"
                  value={site.apiKey}
                  readOnly
                  style={{ fontFamily: "ui-monospace,SF Mono,Menlo,monospace" }}
                />
                <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                  Regenerate key
                </Button>
                {error && (
                  <p className="text-sm" style={{ color: "var(--brick)" }}>
                    {error}
                  </p>
                )}
                {showRegenNotice && (
                  <p className="text-sm" style={{ color: "var(--stamp)" }}>
                    Key regenerated. Update your tracking snippet from your codebase.
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <div className="card-kicker">Tracking snippet</div>
              <p className="card-body">This is your tracking snippet.</p>
              <CodeBlock>{snippet}</CodeBlock>
              <p className="card-body" style={{ marginTop: "var(--space-3)" }}>
                If you&apos;re a developer (or have one), here&apos;s the{" "}
                <Link to="/docs">complete integration guide →</Link>.
              </p>
              <p className="card-body">Need a hand with integration? Reach us however&apos;s easiest:</p>
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
            </Card>
          </>
        )}

        <Dialog
          open={confirmOpen}
          title="Regenerate API key?"
          onClose={() => setConfirmOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegenerate} loading={regenerating}>
                Regenerate
              </Button>
            </>
          }
        >
          <span style={{ color: "var(--brick)" }}>
            The current key stops working the moment you confirm. Tracking on{" "}
            {site?.domain} will silently stop until your developer updates the snippet
            with the new key.
          </span>
        </Dialog>
      </main>
    </AppLayout>
  );
}
