import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Tag from "../../components/ui/Tag";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function StatTile({ label, value }) {
  return (
    <Card elevation="sm">
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

  const overLimitQuery = useQuery({
    queryKey: queryKeys.admin.users.overLimit,
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/users/over-limit");
      return data.users;
    },
  });

  const stats = statsQuery.data;
  const loading = statsQuery.isPending;
  const error = statsQuery.isError
    ? getApiErrorMessage(statsQuery.error, "Could not load platform stats.")
    : null;

  const overLimitUsers = overLimitQuery.data ?? [];

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
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{ gap: "var(--space-3)", marginBottom: "var(--space-3)" }}
            >
              <StatTile label="Total users" value={formatNumber(stats.totalUsers)} />
              <StatTile label="Active users" value={formatNumber(stats.activeUsers)} />
              <StatTile label="Banned users" value={formatNumber(stats.bannedUsers)} />
              <StatTile label="Total sites" value={formatNumber(stats.totalSites)} />
              <StatTile label="Total events" value={formatNumber(stats.totalEvents)} />
              <StatTile label="New users (7d)" value={formatNumber(stats.newUsersLast7Days)} />
            </div>

            <div className="card-kicker" style={{ marginBottom: "var(--space-2)" }}>
              Plan distribution
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}
            >
              <StatTile label="Free" value={formatNumber(stats.planDistribution.Free)} />
              <StatTile label="Pro" value={formatNumber(stats.planDistribution.Pro)} />
              <StatTile label="Business" value={formatNumber(stats.planDistribution.Business)} />
            </div>

            <Card>
              <div className="card-kicker">Attention needed</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                Users over their plan's site limit
              </div>
              {overLimitQuery.isPending ? (
                <Skeleton height={60} />
              ) : overLimitQuery.isError ? null : overLimitUsers.length === 0 ? (
                <p className="card-body" style={{ opacity: 0.6 }}>
                  Nobody's over their limit right now.
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Plan</th>
                        <th>Sites</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overLimitUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <Link to={`/admin/users/${u.id}`}>{u.fullName}</Link>
                          </td>
                          <td>
                            <Tag variant="neutral">{u.plan}</Tag>
                          </td>
                          <td>{u.siteCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </AdminLayout>
  );
}
