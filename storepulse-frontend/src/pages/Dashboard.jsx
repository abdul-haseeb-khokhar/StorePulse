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

// No backend endpoint ranks products by clicks yet — this stays an
// empty state until one exists (analytics.repository.js only exposes
// page-view/click counts and daily traffic, not per-product ranking).
const TOP_PRODUCTS = [];

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
                      {TOP_PRODUCTS.length === 0 ? (
                        <tr>
                          <td colSpan={2} style={{ opacity: 0.6 }}>
                            No data available yet.
                          </td>
                        </tr>
                      ) : (
                        TOP_PRODUCTS.map((product) => (
                          <tr key={product.name}>
                            <td>{product.name}</td>
                            <td>{product.clicks}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>

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
