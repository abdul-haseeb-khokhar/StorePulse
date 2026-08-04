import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

// A simpler cousin of components/dashboard/StatCard — same torn-card/barcode
// language, but without the trend/rangeLabel line, since these are
// point-in-time platform totals, not numbers being compared to a prior period.
function StatTile({ label, value }) {
  return (
    <Card elevation="sm" torn>
      <div className="flex items-start justify-between">
        <div className="card-kicker">{label}</div>
        <span className="barcode" aria-hidden="true" />
      </div>
      <div className="num" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
        {value}
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const statsQuery = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/stats");
      return data.stats;
    },
  });

  const stats = statsQuery.data;
  const loading = statsQuery.isPending;
  const error = statsQuery.isError
    ? getApiErrorMessage(statsQuery.error, "Could not load platform stats.")
    : null;

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Platform overview</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "var(--space-3)" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} elevation="sm">
                <Skeleton width={90} height={10} style={{ marginBottom: "var(--space-2)" }} />
                <Skeleton width={70} height={28} />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "var(--space-3)" }}>
            <StatTile label="Total users" value={formatNumber(stats.totalUsers)} />
            <StatTile label="Active users" value={formatNumber(stats.activeUsers)} />
            <StatTile label="Banned users" value={formatNumber(stats.bannedUsers)} />
            <StatTile label="Total sites" value={formatNumber(stats.totalSites)} />
            <StatTile label="Total events" value={formatNumber(stats.totalEvents)} />
            <StatTile label="New users (7d)" value={formatNumber(stats.newUsersLast7Days)} />
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
