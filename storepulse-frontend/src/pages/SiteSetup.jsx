import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Info, Code2, Copy, Check, Lightbulb } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api, { API_BASE_URL, getApiErrorMessage } from "../lib/api";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (e.g. no permission); fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md bg-on-surface/10 px-2.5 py-1.5
        text-xs font-medium text-on-surface hover:bg-on-surface/20"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function SiteSetup() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

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

  async function handleRegenerateKey() {
    setError(null);
    setRegenerating(true);
    try {
      const { data } = await api.patch(`/sites/${siteId}/api-key`);
      setSite(data.site);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate the API key."));
    } finally {
      setRegenerating(false);
    }
  }

  const snippet = site
    ? `<script src="${API_BASE_URL}/track.js" data-site-key="${site.apiKey}"></script>`
    : "";

  return (
    <AppLayout>
      <Topbar />
      <main className="flex-1 px-6 py-8">
        {loading ? (
          <Card className="px-6 py-10 text-sm text-on-surface-variant">Loading setup...</Card>
        ) : error && !site ? (
          <Card className="px-6 py-10 text-sm text-error">{error}</Card>
        ) : (
          <>
        <div className="overflow-hidden rounded-2xl bg-primary px-8 py-7 text-on-primary">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Your site is ready</h1>
              <p className="mt-1 text-sm text-on-primary/85">
                StorePulse is now connected. Follow the steps below to finish setup.
              </p>
            </div>
            <CheckCircle2 className="h-10 w-10 flex-shrink-0 text-on-primary/90" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Info className="h-4 w-4" />
              Site Details
            </h2>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Site Name
            </p>
            <p className="mt-1 text-lg font-semibold text-on-surface">{site.name}</p>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              API Key
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-outline-variant
                bg-surface-low px-3 py-2.5 text-sm text-on-surface">
                {site.apiKey}
              </code>
              <CopyButton text={site.apiKey} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant/40 pt-3">
              <p className="text-xs text-on-surface-variant">Key active and valid for production</p>
              <Button
                type="button"
                variant="secondary"
                size="md"
                loading={regenerating}
                onClick={handleRegenerateKey}
              >
                Regenerate
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-error">{error}</p>}
          </Card>

          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Code2 className="h-4 w-4" />
              Install your tracking script
            </h2>

            <div className="mt-4 flex items-start justify-between gap-2 rounded-lg bg-on-surface
              px-4 py-3">
              <code className="flex-1 overflow-x-auto whitespace-pre text-xs text-surface-lowest
                [scrollbar-width:thin]">
                {snippet}
              </code>
              <CopyButton text={snippet} />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary-container/10 p-3
              text-xs text-on-surface-variant">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              Paste this snippet before the closing <code className="text-on-surface">&lt;/body&gt;</code> tag
              on your store&apos;s pages.
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary">Documentation</Button>
          <Link
            to={`/dashboard?site=${site.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary
              px-5 py-3 text-base font-semibold text-on-primary hover:bg-[#2c1ea8]"
          >
            Go to Dashboard
          </Link>
        </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
