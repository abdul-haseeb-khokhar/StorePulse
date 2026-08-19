/**
 * SiteSettings — view/manage an existing site: read-only name/domain/API
 * key, key regeneration (with a confirmation dialog, since it breaks
 * tracking until the snippet is updated), and the tracking snippet.
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import CodeBlock from "../components/ui/CodeBlock";
import Skeleton from "../components/ui/Skeleton";
import { ContactLink } from "../components/ui/ContactLink";
import api, { API_BASE_URL, getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";

function SiteSettingsSkeleton() {
  return (
    <>
      <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
        <Skeleton width={100} height={10} style={{ marginBottom: "var(--space-2)" }} />
        <Skeleton width={160} height={22} style={{ marginBottom: "var(--space-3)" }} />
        <div className="grid" style={{ gap: "var(--space-3)" }}>
          <div>
            <Skeleton width={70} height={10} style={{ marginBottom: 5 }} />
            <Skeleton height={36} />
          </div>
          <div>
            <Skeleton width={60} height={10} style={{ marginBottom: 5 }} />
            <Skeleton height={36} />
          </div>
          <div>
            <Skeleton width={50} height={10} style={{ marginBottom: 5 }} />
            <Skeleton height={36} />
          </div>
          <Skeleton width={140} height={36} />
        </div>
      </Card>

      <Card>
        <Skeleton width={120} height={10} style={{ marginBottom: "var(--space-2)" }} />
        <Skeleton width="90%" height={12} style={{ marginBottom: "var(--space-3)" }} />
        <Skeleton height={60} />
      </Card>
    </>
  );
}

export default function SiteSettings() {
  const { siteId } = useParams();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showRegenNotice, setShowRegenNotice] = useState(false);
  const [regenerateError, setRegenerateError] = useState(null);
  const [confirmRegenPublicOpen, setConfirmRegenPublicOpen] = useState(false);
  const [showRegenPublicNotice, setShowRegenPublicNotice] = useState(false);
  const [publicAccessError, setPublicAccessError] = useState(null);

  const siteQuery = useQuery({
    queryKey: queryKeys.sites.detail(siteId),
    queryFn: async () => {
      const { data } = await api.get(`/sites/${siteId}`);
      return data.site;
    },
  });
  const site = siteQuery.data ?? null;
  const loading = siteQuery.isPending;
  const loadError = siteQuery.isError
    ? getApiErrorMessage(siteQuery.error, "Could not load this site.")
    : null;

  const regenerateMutation = useMutation({
    mutationFn: () => api.patch(`/sites/${siteId}/api-key`),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.sites.detail(siteId), data.site);
      setShowRegenNotice(true);
    },
    onError: (err) => setRegenerateError(getApiErrorMessage(err, "Could not regenerate the API key.")),
    onSettled: () => setConfirmOpen(false),
  });

  function handleRegenerate() {
    setRegenerateError(null);
    regenerateMutation.mutate();
  }

  const togglePublicAccessMutation = useMutation({
    mutationFn: (enabled) => api.patch(`/sites/${siteId}/public-access`, { enabled }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.sites.detail(siteId), data.site);
      setShowRegenPublicNotice(false);
    },
    onError: (err) => setPublicAccessError(getApiErrorMessage(err, "Could not update the public dashboard.")),
  });

  const regeneratePublicTokenMutation = useMutation({
    mutationFn: () => api.patch(`/sites/${siteId}/public-access/regenerate`),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.sites.detail(siteId), data.site);
      setShowRegenPublicNotice(true);
    },
    onError: (err) => setPublicAccessError(getApiErrorMessage(err, "Could not regenerate the public link.")),
    onSettled: () => setConfirmRegenPublicOpen(false),
  });

  function handleTogglePublicAccess(enabled) {
    setPublicAccessError(null);
    togglePublicAccessMutation.mutate(enabled);
  }

  function handleRegeneratePublicToken() {
    setPublicAccessError(null);
    regeneratePublicTokenMutation.mutate();
  }

  const publicDashboardUrl =
    site?.publicDashboardEnabled && site?.publicToken
      ? `${window.location.origin}/public/${site.publicToken}`
      : "";

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
          <SiteSettingsSkeleton />
        ) : loadError && !site ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {loadError}
            </p>
          </Card>
        ) : (
          <>
            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">{site.domain}</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                {site.name}
              </div>
              {site.active === false && (
                <p className="card-body" style={{ marginBottom: "var(--space-3)", color: "var(--brick)" }}>
                  This site isn&apos;t included in your current plan — tracking and analytics are
                  paused, but nothing here has been deleted. <Link to="/billing/upgrade">Upgrade</Link>{" "}
                  to reactivate it.
                </p>
              )}
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
                {regenerateError && (
                  <p className="text-sm" style={{ color: "var(--brick)" }}>
                    {regenerateError}
                  </p>
                )}
                {showRegenNotice && (
                  <p className="text-sm" style={{ color: "var(--stamp)" }}>
                    Key regenerated. Update your tracking snippet from your codebase.
                  </p>
                )}
              </div>
            </Card>

            <Card style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Sharing</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                Public dashboard
              </div>
              <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
                Share a read-only dashboard for {site.name} — no login required. Paste the
                link into your client&apos;s own site so they can check their analytics
                directly.
              </p>

              {site.publicDashboardEnabled ? (
                <div className="grid" style={{ gap: "var(--space-3)" }}>
                  <CodeBlock language="link">{publicDashboardUrl}</CodeBlock>
                  <div className="flex items-center flex-wrap" style={{ gap: "var(--space-3)" }}>
                    <Button
                      variant="secondary"
                      onClick={() => handleTogglePublicAccess(false)}
                      loading={togglePublicAccessMutation.isPending}
                    >
                      Turn off
                    </Button>
                    <Button variant="outline" onClick={() => setConfirmRegenPublicOpen(true)}>
                      Regenerate link
                    </Button>
                  </div>
                  <p className="text-sm" style={{ opacity: 0.6 }}>
                    Turning this off hides the dashboard immediately, but doesn&apos;t
                    invalidate the link — turning it back on reuses the same one. If this
                    link leaked and you need the old one to stop working, use{" "}
                    <strong>Regenerate link</strong> instead.
                  </p>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => handleTogglePublicAccess(true)}
                  loading={togglePublicAccessMutation.isPending}
                >
                  Enable public dashboard
                </Button>
              )}

              {publicAccessError && (
                <p className="text-sm" style={{ color: "var(--brick)", marginTop: "var(--space-3)" }}>
                  {publicAccessError}
                </p>
              )}
              {showRegenPublicNotice && (
                <p className="text-sm" style={{ color: "var(--stamp)", marginTop: "var(--space-3)" }}>
                  Link regenerated. The old public link no longer works — share the new one instead.
                </p>
              )}
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
                <ContactLink />
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
              <Button onClick={handleRegenerate} loading={regenerateMutation.isPending}>
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

        <Dialog
          open={confirmRegenPublicOpen}
          title="Regenerate public link?"
          onClose={() => setConfirmRegenPublicOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setConfirmRegenPublicOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegeneratePublicToken} loading={regeneratePublicTokenMutation.isPending}>
                Regenerate
              </Button>
            </>
          }
        >
          <span style={{ color: "var(--brick)" }}>
            The current public link stops working the moment you confirm. Anyone you already
            shared it with will need the new one.
          </span>
        </Dialog>
      </main>
    </AppLayout>
  );
}
