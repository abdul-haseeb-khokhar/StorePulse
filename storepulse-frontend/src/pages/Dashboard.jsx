import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, MousePointerClick, Users, ChevronDown, MoreHorizontal, Filter, Plus } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/dashboard/StatCard";
import TrafficChart from "../components/dashboard/TrafficChart";
import RankedList from "../components/dashboard/RankedList";
import api, { getApiErrorMessage } from "../lib/api";

const rangeLabels = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

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
  const stats = useMemo(() => {
    if (!summary) return [];

    return [
      {
        label: "Total page views",
        value: formatNumber(summary.pageViews.value),
        trend: formatTrend(summary.pageViews.change),
        trendDirection: summary.pageViews.change < 0 ? "down" : "up",
        icon: <Eye className="h-5 w-5" />,
      },
      {
        label: "Total product clicks",
        value: formatNumber(summary.productClicks.value),
        trend: formatTrend(summary.productClicks.change),
        trendDirection: summary.productClicks.change < 0 ? "down" : "up",
        icon: <MousePointerClick className="h-5 w-5" />,
      },
      {
        label: "Unique visitors",
        value: formatNumber(summary.uniqueVisitors.value),
        trend: formatTrend(summary.uniqueVisitors.change),
        trendDirection: summary.uniqueVisitors.change < 0 ? "down" : "up",
        icon: <Users className="h-5 w-5" />,
      },
    ];
  }, [summary]);

  return (
    <AppLayout>
      <Topbar>
        <label className="flex max-w-xs items-center gap-2">
          <span className="sr-only">Selected site</span>
          <select
            value={selectedSiteId}
            onChange={(event) => setSelectedSiteId(event.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        </label>
      </Topbar>

      <main className="flex-1 px-6 py-6">
        <div className="flex items-center justify-end gap-3">
          <label className="flex items-center gap-2">
            <span className="sr-only">Date range</span>
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {Object.entries(rangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Link to="/sites/new">
            <Button size="md" icon={<Plus className="h-4 w-4" />}>Add Site</Button>
          </Link>
        </div>

        {loadingSites ? (
          <Card className="mt-5 px-6 py-10 text-sm text-on-surface-variant">Loading dashboard...</Card>
        ) : sites.length === 0 ? (
          <Card className="mt-5 flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="font-semibold text-on-surface">Add a site to start tracking analytics</p>
            <p className="max-w-sm text-sm text-on-surface-variant">
              StorePulse needs one connected storefront before it can show dashboard data.
            </p>
            <Link to="/sites/new">
              <Button icon={<Plus className="h-4 w-4" />}>Add your first site</Button>
            </Link>
          </Card>
        ) : error ? (
          <Card className="mt-5 px-6 py-10 text-sm text-error">{error}</Card>
        ) : loadingAnalytics && !summary ? (
          <Card className="mt-5 px-6 py-10 text-sm text-on-surface-variant">Loading analytics...</Card>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-on-surface">{selectedSite?.name}</h1>
                <p className="text-sm text-on-surface-variant">{selectedSite?.domain}</p>
              </div>
              {loadingAnalytics && <p className="text-sm text-on-surface-variant">Refreshing...</p>}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="mt-5">
              <TrafficChart data={traffic} />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <RankedList
                title="Top Clicked Products"
                items={[]}
                valueLabel="clicks"
                icon={
                  <button type="button" aria-label="More options" className="text-on-surface-variant">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              />
              <RankedList
                title="Top Referrers"
                items={[]}
                valueLabel="visits"
                icon={
                  <button type="button" aria-label="Filter" className="text-on-surface-variant">
                    <Filter className="h-4 w-4" />
                  </button>
                }
              />
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
