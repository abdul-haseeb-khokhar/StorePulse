/**
 * BillingHistory — paginated table of every recorded subscription change
 * (admin plan changes, cancellations, lazy expirations) for the logged-in
 * user, mirroring the same data an admin sees on the user's detail page.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { formatHistoryReason } from "../lib/plan";

export default function BillingHistory() {
  const [page, setPage] = useState(1);

  const historyQuery = useQuery({
    queryKey: queryKeys.billing.history({ page, limit: 20 }),
    queryFn: async () => {
      const { data } = await api.get("/billing/history", { params: { page, limit: 20 } });
      return data;
    },
  });

  const loading = historyQuery.isPending;
  const error = historyQuery.isError
    ? getApiErrorMessage(historyQuery.error, "Could not load billing history.")
    : null;
  const entries = historyQuery.data?.entries ?? [];
  const totalPages = historyQuery.data?.totalPages ?? 1;

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 720, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link to="/billing" className="text-sm" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>
          ← Back to Billing
        </Link>
        <h1 style={{ marginBottom: "var(--space-4)" }}>Billing history</h1>

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
        ) : entries.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">No billing history yet</div>
          </Card>
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Cycle</th>
                    <th>What happened</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td>{entry.plan}</td>
                      <td>{entry.billingCycle || "—"}</td>
                      <td>{formatHistoryReason(entry.reason)}</td>
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
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
