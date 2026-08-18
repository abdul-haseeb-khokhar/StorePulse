import { useQueries, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { containerStagger, itemFadeUp, useReducedMotion } from "../lib/motion";

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function SiteCard({ site }) {
  const navigate = useNavigate();

  return (
    <Card
      elevation="sm"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/dashboard?site=${site.id}`)}
    >
      <div className="card-kicker">{site.domain}</div>
      <div className="card-title">{site.name}</div>
      <p className="card-body">
        {site.active === false
          ? "Not included in your current plan"
          : site.summary
            ? `${formatNumber(site.summary.uniqueVisitors.value)} unique visitors · last 7 days`
            : "No traffic yet"}
      </p>
      <div className="card-meta" style={{ justifyContent: "space-between" }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          {site.active === false ? (
            <Tag variant="outline">Locked</Tag>
          ) : (
            <>
              <Tag variant="accent">Live</Tag>
              {site.summary && <span>{formatNumber(site.summary.pageViews.value)} page views</span>}
            </>
          )}
        </span>
        <Link
          to={`/sites/${site.id}/settings`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center"
          aria-label="Site settings"
          title="Site settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

function SiteCardSkeleton() {
  return (
    <Card elevation="sm">
      <Skeleton width={90} height={10} style={{ marginBottom: "var(--space-2)" }} />
      <Skeleton width={140} height={18} style={{ marginBottom: "var(--space-2)" }} />
      <Skeleton width="70%" height={12} style={{ marginBottom: "var(--space-3)" }} />
      <div className="flex items-center justify-between">
        <Skeleton width={50} height={20} />
        <Skeleton width={16} height={16} />
      </div>
    </Card>
  );
}

export default function SitesList() {
  const reduceMotion = useReducedMotion();
  const sitesQuery = useQuery({
    queryKey: queryKeys.sites.all,
    queryFn: async () => {
      const { data } = await api.get("/sites");
      return data.sites;
    },
  });

  const summaryQueries = useQueries({
    queries: (sitesQuery.data ?? []).map((site) => ({
      queryKey: queryKeys.analytics.summary(site.id, "7d"),
      queryFn: async () => {
        const { data } = await api.get(`/analytics/${site.id}/summary`, {
          params: { range: "7d" },
        });
        return data.summary;
      },
      // A locked (over-limit) site 403s this endpoint server-side (see
      // analytics.service.js's assertSiteActive) — skipping the request
      // entirely avoids a guaranteed-failing round trip for a card that
      // already shows its own "not included in your plan" state instead.
      enabled: site.active !== false,
      retry: 0,
    })),
  });

  const sites = (sitesQuery.data ?? []).map((site, i) => ({
    ...site,
    summary: summaryQueries[i]?.data ?? null,
  }));
  // isPending stays true forever for a disabled query (a locked site's
  // summary never even starts fetching) — isLoading correctly reflects
  // "actually in flight", so it doesn't get stuck waiting on those.
  const loading = sitesQuery.isPending || summaryQueries.some((q) => q.isLoading);
  // Guarded by sites.length === 0 so a background refetch failure (e.g. on
  // reconnect) can't blank out a list we're already successfully showing.
  const error =
    sitesQuery.isError && sites.length === 0
      ? getApiErrorMessage(sitesQuery.error, "Could not load your sites.")
      : null;

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <div
          className="flex items-baseline justify-between"
          style={{ marginBottom: "var(--space-4)" }}
        >
          <h1 style={{ margin: 0 }}>Your sites</h1>
          <Link to="/sites/new">
            <Button>Add site</Button>
          </Link>
        </div>

        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "var(--space-3)" }}
          >
            <SiteCardSkeleton />
            <SiteCardSkeleton />
            <SiteCardSkeleton />
          </div>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : sites.length === 0 ? (
          <Card
            className="flex flex-col items-center text-center"
            style={{ padding: "var(--space-8)" }}
          >
            <div className="card-title">No sites yet</div>
            <p className="card-body">
              Add your first site to start tracking page views and product clicks.
            </p>
            <Link to="/sites/new">
              <Button>Add your first site</Button>
            </Link>
          </Card>
        ) : (
          <motion.div
            // Mount-triggered rather than whileInView: this grid is the
            // page's primary content, not below-the-fold marketing copy.
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? false : "visible"}
            variants={reduceMotion ? undefined : containerStagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "var(--space-3)" }}
          >
            {sites.map((site) => (
              <motion.div key={site.id} variants={reduceMotion ? undefined : itemFadeUp}>
                <SiteCard site={site} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </AppLayout>
  );
}
