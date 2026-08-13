import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const params = { page, limit: 20 };

  const logsQuery = useQuery({
    queryKey: queryKeys.admin.logs(params),
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/logs", { params });
      return data;
    },
  });

  const logs = logsQuery.data?.logs ?? [];
  const totalPages = logsQuery.data?.totalPages ?? 1;
  const loading = logsQuery.isPending;
  const error = logsQuery.isError ? getApiErrorMessage(logsQuery.error, "Could not load logs.") : null;

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Activity log</h1>

        {loading ? (
          <Card>
            <Skeleton height={200} />
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">No activity yet</div>
          </Card>
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>{log.admin ? log.admin.fullName || log.admin.email : "—"}</td>
                      <td>{log.action}</td>
                      <td>
                        {log.targetedUser ? (
                          <Link to={`/admin/users/${log.targetedUser.id}`}>
                            {log.targetedUser.fullName || log.targetedUser.email}
                          </Link>
                        ) : log.targetedUserId ? (
                          "Deleted user"
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ marginTop: "var(--space-3)" }}>
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
