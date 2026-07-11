import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Topbar from "../components/ui/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import api, { getApiErrorMessage } from "../lib/api";

const statusStyles = {
  connected: "bg-secondary-container text-on-secondary-container",
  maintenance: "bg-error-container text-on-error-container",
};

function SiteCard({ site }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-on-surface">{site.name}</h3>
          <p className="text-sm text-on-surface-variant">{site.domain}</p>
        </div>
        {site.status && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide
              ${statusStyles[site.status]}`}
          >
            {site.status}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-on-surface-variant">Created</p>
          <p className="text-xl font-bold text-on-surface">{site.createdAtLabel}</p>
        </div>
        <Link
          to={`/dashboard?site=${site.id}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Details
          <ArrowRight className="h-3.5 w-3.5" />
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
        if (!ignore) {
          setSites(
            data.sites.map((site) => ({
              ...site,
              createdAtLabel: new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
              }).format(new Date(site.createdAt)),
              status: "connected",
            })),
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, "Could not load your sites."));
        }
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
      <Topbar />
      <main className="flex-1 px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Your sites</h1>
            <p className="mt-1 max-w-lg text-sm text-on-surface-variant">
              Manage all your connected e-commerce storefronts and monitor their
              real-time performance from a single view.
            </p>
          </div>
          <Link to="/sites/new">
            <Button icon={<Plus className="h-4 w-4" />}>Add new site</Button>
          </Link>
        </div>

        {loading ? (
          <Card className="mt-8 px-6 py-10 text-sm text-on-surface-variant">
            Loading your sites...
          </Card>
        ) : error ? (
          <Card className="mt-8 px-6 py-10 text-sm text-error">{error}</Card>
        ) : sites.length === 0 ? (
          <Card className="mt-8 flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="font-semibold text-on-surface">No sites connected yet</p>
            <p className="max-w-sm text-sm text-on-surface-variant">
              Add your first site to start tracking page views and product clicks.
            </p>
            <Link to="/sites/new">
              <Button icon={<Plus className="h-4 w-4" />}>Add your first site</Button>
            </Link>
          </Card>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
