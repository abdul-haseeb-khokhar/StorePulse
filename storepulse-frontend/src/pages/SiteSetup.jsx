import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api, { API_BASE_URL, getApiErrorMessage } from "../lib/api";

export default function SiteSetup() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyLabel, setCopyLabel] = useState("Copy snippet");

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
      setTimeout(() => setCopyLabel("Copy snippet"), 1600);
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
        <h1 style={{ marginBottom: "var(--space-4)" }}>Add a site</h1>

        {loading ? (
          <Card>
            <p className="card-body">Loading…</p>
          </Card>
        ) : error && !site ? (
          <Card>
            <p className="card-body" style={{ color: "#b3261e" }}>
              {error}
            </p>
          </Card>
        ) : (
          <Card elevation="md">
            <div className="card-kicker">{site.domain}</div>
            <div className="card-title">{site.name} is ready</div>
            <p className="card-body">
              Integrating tracking usually isn&apos;t a copy-paste job for a live store.
              Send this snippet to your developer and have them add it before the
              closing &lt;/body&gt; tag on every page you want to track.
            </p>
            <p
              className="card-body"
              style={{
                fontFamily: "ui-monospace,SF Mono,Menlo,monospace",
                fontSize: 13,
                background: "var(--color-neutral-100)",
                border: "1px solid var(--color-neutral-300)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-3)",
                overflowX: "auto",
                whiteSpace: "pre",
              }}
            >
              {snippet}
            </p>
            <div className="flex" style={{ gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              <Button variant="secondary" onClick={handleCopy}>
                {copyLabel}
              </Button>
              <Button onClick={() => navigate(`/dashboard?site=${site.id}`)}>
                Go to dashboard
              </Button>
            </div>
            <div className="card-meta" style={{ marginTop: "var(--space-3)", gap: "var(--space-3)" }}>
              <a href="mailto:dev@storepulse.io">dev@storepulse.io</a>
              <a href="https://wa.me/10000000000" target="_blank" rel="noopener noreferrer">
                WhatsApp: +1 000 000 0000
              </a>
            </div>
          </Card>
        )}

        {site && (
          <p className="text-sm" style={{ marginTop: "var(--space-3)" }}>
            Need to rotate the API key later? <Link to={`/sites/${site.id}/settings`}>Manage this site</Link>
          </p>
        )}
      </main>
    </AppLayout>
  );
}
