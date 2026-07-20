import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import api, { getApiErrorMessage } from "../lib/api";

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
        {site.summary
          ? `${formatNumber(site.summary.uniqueVisitors.value)} unique visitors · last 7 days`
          : "No traffic yet"}
      </p>
      <div className="card-meta" style={{ justifyContent: "space-between" }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          <Tag variant="accent">Live</Tag>
          {site.summary && <span>{formatNumber(site.summary.pageViews.value)} page views</span>}
        </span>
        <Link
          to={`/sites/${site.id}/settings`}
          onClick={(e) => e.stopPropagation()}
        >
          Settings
        </Link>
      </div>
    </Card>
  );
}

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadSites() {
      try {
        const { data } = await api.get("/sites");
        if (ignore) return;

        const withSummary = await Promise.all(
          data.sites.map(async (site) => {
            try {
              const { data: summaryData } = await api.get(`/analytics/${site.id}/summary`, {
                params: { range: "7d" },
              });
              return { ...site, summary: summaryData.summary };
            } catch {
              return { ...site, summary: null };
            }
          }),
        );

        if (!ignore) setSites(withSummary);
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, "Could not load your sites."));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSites();
    return () => {
      ignore = true;
    };
  }, []);

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
          <Card>
            <p className="card-body">Loading your sites…</p>
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "#b3261e" }}>
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
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "var(--space-3)" }}
          >
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
