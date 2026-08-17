import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CodeBlock from "../components/ui/CodeBlock";
import Skeleton from "../components/ui/Skeleton";
import api, { API_BASE_URL, getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { NYRON_CONTACT_URL } from "../lib/contact";

function SiteSetupSkeleton() {
  return (
    <Card elevation="md">
      <Skeleton width={100} height={10} style={{ marginBottom: "var(--space-2)" }} />
      <Skeleton width={180} height={22} style={{ marginBottom: "var(--space-3)" }} />
      <Skeleton width="60%" height={12} style={{ marginBottom: "var(--space-3)" }} />
      <Skeleton height={60} style={{ marginBottom: "var(--space-3)" }} />
      <div className="flex" style={{ gap: "var(--space-2)" }}>
        <Skeleton width={120} height={36} />
        <Skeleton width={150} height={36} />
      </div>
    </Card>
  );
}

export default function SiteSetup() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [copyLabel, setCopyLabel] = useState("Copy script");

  const siteQuery = useQuery({
    queryKey: queryKeys.sites.detail(siteId),
    queryFn: async () => {
      const { data } = await api.get(`/sites/${siteId}`);
      return data.site;
    },
  });
  const site = siteQuery.data ?? null;
  const loading = siteQuery.isPending;
  const error = siteQuery.isError ? getApiErrorMessage(siteQuery.error, "Could not load this site.") : null;

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
          <SiteSetupSkeleton />
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
                href={NYRON_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm"
                style={{ gap: 6 }}
              >
                <ExternalLink className="h-4 w-4 text-muted" />
                Contact Us
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
