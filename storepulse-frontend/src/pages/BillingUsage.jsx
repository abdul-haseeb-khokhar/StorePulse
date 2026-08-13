import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

export default function BillingUsage() {
  const usageQuery = useQuery({
    queryKey: queryKeys.sites.usage,
    queryFn: async () => {
      const { data } = await api.get("/sites/usage");
      return data;
    },
  });

  const loading = usageQuery.isPending;
  const error = usageQuery.isError
    ? getApiErrorMessage(usageQuery.error, "Could not load usage.")
    : null;

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link to="/billing" className="text-sm" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>
          ← Back to Billing
        </Link>
        <h1 style={{ marginBottom: "var(--space-4)" }}>Usage</h1>

        {loading ? (
          <Card>
            <Skeleton height={140} />
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <Card elevation="md">
            <div className="card-kicker">This month</div>
            <div className="card-title" style={{ marginTop: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              Events per site
            </div>
            {usageQuery.data.sites.length === 0 ? (
              <p className="card-body" style={{ opacity: 0.6 }}>
                Add a site to start tracking usage.
              </p>
            ) : (
              <div className="grid" style={{ gap: "var(--space-3)" }}>
                {usageQuery.data.sites.map((site) => {
                  const limit = usageQuery.data.maxMonthlyEvents;
                  // null means unlimited (see sites.service.js's getUsageSummary —
                  // JSON has no Infinity, so "no limit" has to be an explicit null).
                  const pct = limit === null ? null : Math.min(100, (site.eventsThisMonth / limit) * 100);
                  return (
                    <div key={site.siteId}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{site.name}</span>
                        <span className="text-muted">
                          {formatNumber(site.eventsThisMonth)} /{" "}
                          {limit === null ? "Unlimited" : formatNumber(limit)} events this month
                        </span>
                      </div>
                      {pct !== null && (
                        <div
                          style={{
                            height: 4,
                            borderRadius: 999,
                            background: "var(--divider-soft)",
                            marginTop: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: pct >= 100 ? "var(--brick)" : "var(--stamp)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </main>
    </AppLayout>
  );
}
