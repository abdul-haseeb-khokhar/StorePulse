import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Settings } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import Seg from "../components/ui/Seg";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import TrafficChart from "../components/dashboard/TrafficChart";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";

const rangeLabels = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

// Events land via the storefront's tracking snippet, outside React Query's
// cache entirely — polling is what keeps the stat cards/chart feeling live
// while this page is open, since nothing else would trigger a refetch of
// already-fresh-enough data. Paused automatically while the tab isn't
// focused (React Query's refetchIntervalInBackground default is false).
const LIVE_METRICS_REFETCH_MS = 30_000;

// The top-products/top-referrers endpoints take explicit startDate/endDate
// query params (unlike summary/traffic, which take a `range` string the
// backend converts itself) — mirror analytics.controller.js's own
// getDateRangeFromQuery mapping here so all four panels show the same window.
function getDateBoundaryParams(range) {
  const days = RANGE_DAYS[range] || 7;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function formatTrend(change) {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change || 0}%`;
}

function formatChartDate(date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

// Events sit in a Redis buffer for up to ~10s (see ingest.buffer.js) before
// landing in Postgres, which is what analytics reads from — so "now" is
// never quite what's on screen. Rather than hide that gap, dataAsOf (set by
// the backend to its last successful buffer flush) lets this render an
// honest "as of Xs ago" instead of implying the numbers are live.
function formatRelativeTime(msAgo) {
  const seconds = Math.max(0, Math.round(msAgo / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSiteId, setSelectedSiteId] = useState(searchParams.get("site") || "");
  const [range, setRange] = useState(searchParams.get("range") || "30d");

  // Ticks once a second purely to re-render the "as of Xs ago" label — the
  // underlying data only actually changes on the 30s poll above.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sitesQuery = useQuery({
    queryKey: queryKeys.sites.all,
    queryFn: async () => {
      const { data } = await api.get("/sites");
      return data.sites;
    },
  });
  const sites = sitesQuery.data ?? [];
  const loadingSites = sitesQuery.isPending;
  // Guarded by sites.length === 0 so a background refetch failure (e.g. on
  // reconnect) can't blank out a dashboard we're already successfully
  // showing — see SitesList.jsx for the same pattern.
  const sitesError =
    sitesQuery.isError && sites.length === 0
      ? getApiErrorMessage(sitesQuery.error, "Could not load your sites.")
      : null;

  // Derived during render rather than synced via setState-in-effect: falls
  // back to the first site once the list arrives, same default the old
  // fetch-success handler picked, without needing an extra render pass.
  const effectiveSiteId = selectedSiteId || sites[0]?.id || "";

  useEffect(() => {
    if (!effectiveSiteId) return;

    const nextParams = new URLSearchParams();
    nextParams.set("site", effectiveSiteId);
    nextParams.set("range", range);
    setSearchParams(nextParams, { replace: true });
  }, [range, effectiveSiteId, setSearchParams]);

  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.summary(effectiveSiteId, range),
    queryFn: async () => {
      const { data } = await api.get(`/analytics/${effectiveSiteId}/summary`, { params: { range } });
      return { summary: data.summary, dataAsOf: data.dataAsOf };
    },
    enabled: Boolean(effectiveSiteId),
    refetchInterval: LIVE_METRICS_REFETCH_MS,
  });

  const trafficQuery = useQuery({
    queryKey: queryKeys.analytics.traffic(effectiveSiteId, range),
    queryFn: async () => {
      const { data } = await api.get(`/analytics/${effectiveSiteId}/traffic`, { params: { range } });
      return {
        traffic: data.traffic.map((item) => ({ ...item, date: formatChartDate(item.date) })),
        dataAsOf: data.dataAsOf,
      };
    },
    enabled: Boolean(effectiveSiteId),
    refetchInterval: LIVE_METRICS_REFETCH_MS,
  });

  const summary = summaryQuery.data?.summary ?? null;
  const traffic = trafficQuery.data?.traffic ?? [];
  const dataAsOf = summaryQuery.data?.dataAsOf ?? trafficQuery.data?.dataAsOf ?? null;
  const analyticsErrorObj = summaryQuery.error ?? trafficQuery.error ?? null;
  const error = analyticsErrorObj ? getApiErrorMessage(analyticsErrorObj, "Could not load analytics.") : null;
  const loadingAnalytics =
    Boolean(effectiveSiteId) && (summaryQuery.isPending || trafficQuery.isPending);

  // Kept separate from the summary/traffic queries above: these two panels
  // are supplementary, so a problem with either endpoint falls back to an
  // empty state instead of taking down the stat cards and chart too.
  const topProductsQuery = useQuery({
    queryKey: queryKeys.analytics.topProducts(effectiveSiteId, range),
    queryFn: async () => {
      const { startDate, endDate } = getDateBoundaryParams(range);
      const { data } = await api.get(`/analytics/${effectiveSiteId}/top-products`, {
        params: { startDate, endDate, limit: 5 },
      });
      return data.data || [];
    },
    enabled: Boolean(effectiveSiteId),
    retry: 0,
  });

  const topReferrersQuery = useQuery({
    queryKey: queryKeys.analytics.topReferrers(effectiveSiteId, range),
    queryFn: async () => {
      const { startDate, endDate } = getDateBoundaryParams(range);
      const { data } = await api.get(`/analytics/${effectiveSiteId}/top-referrers`, {
        params: { startDate, endDate, limit: 5 },
      });
      return data.data || [];
    },
    enabled: Boolean(effectiveSiteId),
    retry: 0,
  });

  const topProducts = topProductsQuery.data ?? [];
  const topReferrers = topReferrersQuery.data ?? [];

  const selectedSite = sites.find((site) => site.id === effectiveSiteId);
  const rangeLabel = rangeLabels[range];

  const stats = useMemo(() => {
    if (!summary) return [];

    return [
      {
        label: "Page views",
        value: formatNumber(summary.pageViews.value),
        trend: formatTrend(summary.pageViews.change),
        trendDirection: summary.pageViews.change < 0 ? "down" : summary.pageViews.change === 0 ? "flat" : "up",
      },
      {
        label: "Product clicks",
        value: formatNumber(summary.productClicks.value),
        trend: formatTrend(summary.productClicks.change),
        trendDirection:
          summary.productClicks.change < 0 ? "down" : summary.productClicks.change === 0 ? "flat" : "up",
      },
      {
        label: "Unique visitors",
        value: formatNumber(summary.uniqueVisitors.value),
        trend: formatTrend(summary.uniqueVisitors.change),
        trendDirection:
          summary.uniqueVisitors.change < 0 ? "down" : summary.uniqueVisitors.change === 0 ? "flat" : "up",
      },
    ];
  }, [summary]);

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        {loadingSites ? (
          <DashboardSkeleton showHeader />
        ) : sitesError ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">Could not load your sites</div>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {sitesError}
            </p>
          </Card>
        ) : sites.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">Add a site to start tracking analytics</div>
            <p className="card-body">
              StorePulse needs one connected storefront before it can show dashboard
              data.
            </p>
            <Link to="/sites/new">
              <Button>Add your first site</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div
              className="flex flex-wrap items-end justify-between"
              style={{ gap: "var(--space-3)", marginBottom: "var(--space-5)" }}
            >
              <div>
                <Tag variant="outline" className="w-fit" style={{ marginBottom: "var(--space-2)" }}>
                  {selectedSite?.domain}
                </Tag>
                <h1 style={{ margin: 0 }}>{selectedSite?.name}</h1>
                {dataAsOf && (
                  <p className="text-sm" style={{ opacity: 0.6, marginTop: "var(--space-1)", marginBottom: 0 }}>
                    Data as of {formatRelativeTime(now - new Date(dataAsOf).getTime())}
                  </p>
                )}
              </div>

              <div className="flex items-center" style={{ gap: "var(--space-3)" }}>
                <label className="flex items-center" style={{ gap: 6 }}>
                  <span className="sr-only">Selected site</span>
                  <select
                    value={effectiveSiteId}
                    onChange={(event) => setSelectedSiteId(event.target.value)}
                    className="input"
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Seg
                  name="range"
                  aria-label="Date range"
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: "7d", label: "7d" },
                    { value: "30d", label: "30d" },
                    { value: "90d", label: "90d" },
                  ]}
                />
                {selectedSite && (
                  <Link
                    to={`/sites/${selectedSite.id}/settings`}
                    className="btn btn-secondary btn-icon"
                    aria-label="Site settings"
                    title="Site settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {error && !summary ? (
              <Card>
                <p className="card-body" style={{ color: "var(--brick)" }}>
                  {error}
                </p>
              </Card>
            ) : loadingAnalytics && !summary ? (
              <DashboardSkeleton />
            ) : (
              <>
                <div
                  className="grid grid-cols-1 sm:grid-cols-3"
                  style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}
                >
                  {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} rangeLabel={rangeLabel} />
                  ))}
                </div>

                <div style={{ marginBottom: "var(--space-4)" }}>
                  <TrafficChart data={traffic} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--space-3)" }}>
                  <Card>
                    <div className="card-kicker">Products</div>
                    <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                      Top clicked products
                    </div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.length === 0 ? (
                          <tr>
                            <td colSpan={2} style={{ opacity: 0.6 }}>
                              No data available yet.
                            </td>
                          </tr>
                        ) : (
                          topProducts.map((product) => (
                            <tr key={product.productId}>
                              <td>{product.productName || product.productId}</td>
                              <td>{formatNumber(product.clicks)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Card>

                  <Card>
                    <div className="card-kicker">Traffic sources</div>
                    <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                      Top referrers
                    </div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Referrer</th>
                          <th>Visits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topReferrers.length === 0 ? (
                          <tr>
                            <td colSpan={2} style={{ opacity: 0.6 }}>
                              No data available yet.
                            </td>
                          </tr>
                        ) : (
                          topReferrers.map((referrer, index) => (
                            <tr key={`${referrer.referrers}-${index}`}>
                              <td>{referrer.referrers || "Direct"}</td>
                              <td>{formatNumber(referrer.visitors)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </AppLayout>
  );
}
