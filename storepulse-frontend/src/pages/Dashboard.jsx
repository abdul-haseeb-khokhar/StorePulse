import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import Seg from "../components/ui/Seg";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import TrafficChart from "../components/dashboard/TrafficChart";
import api, { getApiErrorMessage } from "../lib/api";

const rangeLabels = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

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

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(searchParams.get("site") || "");
  const [range, setRange] = useState(searchParams.get("range") || "30d");
  const [summary, setSummary] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadSites() {
      try {
        const { data } = await api.get("/sites");
        if (ignore) return;
        setSites(data.sites);
        setSelectedSiteId((currentSiteId) => currentSiteId || data.sites[0]?.id || "");
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, "Could not load your sites."));
      } finally {
        if (!ignore) setLoadingSites(false);
      }
    }

    loadSites();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSiteId) return;

    const nextParams = new URLSearchParams();
    nextParams.set("site", selectedSiteId);
    nextParams.set("range", range);
    setSearchParams(nextParams, { replace: true });
  }, [range, selectedSiteId, setSearchParams]);

  useEffect(() => {
    if (!selectedSiteId) return;

    let ignore = false;

    async function loadAnalytics() {
      setLoadingAnalytics(true);
      setError(null);
      try {
        const [summaryResponse, trafficResponse] = await Promise.all([
          api.get(`/analytics/${selectedSiteId}/summary`, { params: { range } }),
          api.get(`/analytics/${selectedSiteId}/traffic`, { params: { range } }),
        ]);

        if (ignore) return;
        setSummary(summaryResponse.data.summary);
        setTraffic(
          trafficResponse.data.traffic.map((item) => ({
            ...item,
            date: formatChartDate(item.date),
          })),
        );
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, "Could not load analytics."));
      } finally {
        if (!ignore) setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
    return () => {
      ignore = true;
    };
  }, [range, selectedSiteId]);

  // Kept separate from the summary/traffic fetch above: these two panels
  // are supplementary, so a problem with either endpoint falls back to an
  // empty state instead of taking down the stat cards and chart too.
  useEffect(() => {
    if (!selectedSiteId) return;

    let ignore = false;

    async function loadRankings() {
      const { startDate, endDate } = getDateBoundaryParams(range);
      try {
        const [productsResponse, referrersResponse] = await Promise.all([
          api.get(`/analytics/${selectedSiteId}/top-products`, {
            params: { startDate, endDate, limit: 5 },
          }),
          api.get(`/analytics/${selectedSiteId}/top-referrers`, {
            params: { startDate, endDate, limit: 5 },
          }),
        ]);
        if (ignore) return;
        setTopProducts(productsResponse.data.data || []);
        setTopReferrers(referrersResponse.data.data || []);
      } catch {
        if (!ignore) {
          setTopProducts([]);
          setTopReferrers([]);
        }
      }
    }

    loadRankings();
    return () => {
      ignore = true;
    };
  }, [range, selectedSiteId]);

  const selectedSite = sites.find((site) => site.id === selectedSiteId);
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
          <Card>
            <p className="card-body">Loading dashboard…</p>
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
              </div>

              <div className="flex items-center" style={{ gap: "var(--space-3)" }}>
                <label className="flex items-center" style={{ gap: 6 }}>
                  <span className="sr-only">Selected site</span>
                  <select
                    value={selectedSiteId}
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
              </div>
            </div>

            {error ? (
              <Card>
                <p className="card-body" style={{ color: "#b3261e" }}>
                  {error}
                </p>
              </Card>
            ) : loadingAnalytics && !summary ? (
              <Card>
                <p className="card-body">Loading analytics…</p>
              </Card>
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

                {selectedSite && (
                  <p className="text-sm" style={{ marginTop: "var(--space-3)" }}>
                    <Link to={`/sites/${selectedSite.id}/settings`}>Site settings</Link>
                  </p>
                )}
              </>
            )}
          </>
        )}
      </main>
    </AppLayout>
  );
}
