/**
 * PublicDashboard — the no-auth, read-only page a site owner shares via
 * link (see SiteSettings.jsx's "Public dashboard" section). Same stat
 * cards/traffic chart/top-products/top-referrers panels as the real
 * Dashboard, minus anything owner-only: no site switcher (this page is
 * scoped to exactly the one site its token resolves to), no settings link,
 * no domain/API key anywhere in what it fetches or renders. Unlike the
 * authenticated Dashboard, this doesn't poll — an anonymous visitor
 * refreshing the page is enough, and it keeps this endpoint's load profile
 * predictable under publicDashboardRateLimiter.
 */
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Card from "../components/ui/Card";
import Seg from "../components/ui/Seg";
import ThemeToggle from "../components/ui/ThemeToggle";
import StatCard from "../components/dashboard/StatCard";
import TrafficChart from "../components/dashboard/TrafficChart";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import publicApi from "../lib/publicApi";
import { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { containerStagger, itemFadeUp, useReducedMotion } from "../lib/motion";
import { rangeLabels, getDateBoundaryParams, formatNumber, formatChartDate, buildStatCards } from "../lib/analyticsFormat";

export default function PublicDashboard() {
  const { token } = useParams();
  const reduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const [range, setRange] = useState(searchParams.get("range") || "30d");

  function handleRangeChange(next) {
    setRange(next);
    setSearchParams({ range: next }, { replace: true });
  }

  // Resolves the token to a site name and, implicitly, whether the link is
  // still valid at all — every other query below is gated on this one
  // succeeding, since a bad/disabled token means there's nothing to show.
  const siteQuery = useQuery({
    queryKey: queryKeys.publicDashboard.site(token),
    queryFn: async () => {
      const { data } = await publicApi.get(`/dashboard/${token}`);
      return data.site;
    },
    retry: 0,
  });
  const unavailable = siteQuery.isError;
  const siteName = siteQuery.data?.name ?? null;

  const summaryQuery = useQuery({
    queryKey: queryKeys.publicDashboard.summary(token, range),
    queryFn: async () => {
      const { data } = await publicApi.get(`/dashboard/${token}/summary`, { params: { range } });
      return { summary: data.summary, dataAsOf: data.dataAsOf };
    },
    enabled: !unavailable,
    retry: 0,
  });

  const trafficQuery = useQuery({
    queryKey: queryKeys.publicDashboard.traffic(token, range),
    queryFn: async () => {
      const { data } = await publicApi.get(`/dashboard/${token}/traffic`, { params: { range } });
      return {
        traffic: data.traffic.map((item) => ({ ...item, date: formatChartDate(item.date) })),
        dataAsOf: data.dataAsOf,
      };
    },
    enabled: !unavailable,
    retry: 0,
  });

  const topProductsQuery = useQuery({
    queryKey: queryKeys.publicDashboard.topProducts(token, range),
    queryFn: async () => {
      const { startDate, endDate } = getDateBoundaryParams(range);
      const { data } = await publicApi.get(`/dashboard/${token}/top-products`, {
        params: { startDate, endDate, limit: 5 },
      });
      return data.data || [];
    },
    enabled: !unavailable,
    retry: 0,
  });

  const topReferrersQuery = useQuery({
    queryKey: queryKeys.publicDashboard.topReferrers(token, range),
    queryFn: async () => {
      const { startDate, endDate } = getDateBoundaryParams(range);
      const { data } = await publicApi.get(`/dashboard/${token}/top-referrers`, {
        params: { startDate, endDate, limit: 5 },
      });
      return data.data || [];
    },
    enabled: !unavailable,
    retry: 0,
  });

  const summary = summaryQuery.data?.summary ?? null;
  const traffic = trafficQuery.data?.traffic ?? [];
  const dataAsOf = summaryQuery.data?.dataAsOf ?? trafficQuery.data?.dataAsOf ?? null;
  const topProducts = topProductsQuery.data ?? [];
  const topReferrers = topReferrersQuery.data ?? [];
  const rangeLabel = rangeLabels[range];

  const loadingSite = siteQuery.isPending;
  const analyticsError = summaryQuery.error ?? trafficQuery.error ?? null;
  const loadingAnalytics = !unavailable && (summaryQuery.isLoading || trafficQuery.isLoading);

  const stats = buildStatCards(summary);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--divider)] bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo2.png"
              alt="StorePulse"
              className="h-8 w-auto object-contain logo-light"
            />
            <img
              src="/STOREPULSE-LOGOS/RBG-LOGO/rbglogo3.png"
              alt="StorePulse"
              className="h-8 w-auto object-contain logo-dark"
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-6 flex-1 w-full">
        {loadingSite ? (
          <DashboardSkeleton showHeader />
        ) : unavailable ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">This dashboard link isn&apos;t available</div>
            <p className="card-body">
              {getApiErrorMessage(siteQuery.error, "It may have been turned off, or the link may be wrong.")}
            </p>
          </Card>
        ) : (
          <>
            <div
              className="flex flex-wrap items-end justify-between"
              style={{ gap: "var(--space-3)", marginBottom: "var(--space-5)" }}
            >
              <div>
                <h1 style={{ margin: 0 }}>{siteName}</h1>
                {dataAsOf && (
                  <p className="text-sm" style={{ opacity: 0.6, marginTop: "var(--space-1)", marginBottom: 0 }}>
                    Data as of {new Date(dataAsOf).toLocaleString()}
                  </p>
                )}
              </div>

              <Seg
                name="range"
                aria-label="Date range"
                value={range}
                onChange={handleRangeChange}
                options={[
                  { value: "7d", label: "7d" },
                  { value: "30d", label: "30d" },
                  { value: "90d", label: "90d" },
                ]}
              />
            </div>

            {analyticsError && !summary ? (
              <Card>
                <p className="card-body" style={{ color: "var(--brick)" }}>
                  {getApiErrorMessage(analyticsError, "Could not load analytics.")}
                </p>
              </Card>
            ) : loadingAnalytics && !summary ? (
              <DashboardSkeleton />
            ) : (
              <>
                <motion.div
                  initial={reduceMotion ? false : "hidden"}
                  animate={reduceMotion ? false : "visible"}
                  variants={reduceMotion ? undefined : containerStagger}
                  className="grid grid-cols-1 sm:grid-cols-3"
                  style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}
                >
                  {stats.map((stat) => (
                    <motion.div key={stat.label} variants={reduceMotion ? undefined : itemFadeUp}>
                      <StatCard {...stat} rangeLabel={rangeLabel} />
                    </motion.div>
                  ))}
                </motion.div>

                <div style={{ marginBottom: "var(--space-4)" }}>
                  <TrafficChart data={traffic} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--space-3)" }}>
                  <Card>
                    <div className="card-kicker">Products</div>
                    <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                      Top clicked products
                    </div>
                    <div className="table-wrap">
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
                    </div>
                  </Card>

                  <Card>
                    <div className="card-kicker">Traffic sources</div>
                    <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                      Top referrers
                    </div>
                    <div className="table-wrap">
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
                                <td>{formatNumber(referrer.pageViews)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <footer
        className="border-t border-[var(--divider)] text-center text-xs"
        style={{ opacity: 0.6, padding: "var(--space-4)" }}
      >
        <Link to="/">Powered by StorePulse</Link>
      </footer>
    </div>
  );
}
