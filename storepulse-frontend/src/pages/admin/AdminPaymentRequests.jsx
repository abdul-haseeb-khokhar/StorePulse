/**
 * AdminPaymentRequests — review queue for manual bank-transfer payment
 * requests: filter by status, and approve/reject with an optional note
 * (warns first if approving would discard a user's unused paid time).
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Tag from "../../components/ui/Tag";
import Seg from "../../components/ui/Seg";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import Skeleton from "../../components/ui/Skeleton";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";
import { formatDaysRemaining } from "../../lib/plan";

// Approving a request overwrites the user's subscription immediately, with
// no proration or refund (see subscription.service.js) — so approving a
// switch away from a paid plan that still has time left silently discards
// whatever the user already paid for it. Surfaced here (table + review
// dialog) so an admin can catch that before confirming, not after.
function unusedPaidTime(request) {
  const sub = request.user.subscription;
  if (!sub || sub.plan === "Free" || sub.plan === request.plan || !sub.currentPeriodEnd) {
    return null;
  }
  return new Date(sub.currentPeriodEnd) > new Date() ? sub : null;
}

const STATUS_FILTER_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const STATUS_TAG_VARIANT = {
  Pending: "neutral",
  Approved: "positive",
  Rejected: "negative",
};

export default function AdminPaymentRequests() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Pending");
  const [reviewing, setReviewing] = useState(null); // { request, decision }
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState(null);

  const params = { status };

  const requestsQuery = useQuery({
    queryKey: queryKeys.admin.paymentRequests(params),
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/payment-requests", { params });
      return data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision, note }) =>
      adminApi.patch(`/admin/payment-requests/${id}`, { status: decision, note: note || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-requests"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      setReviewing(null);
      setReviewNote("");
    },
    onError: (err) => setReviewError(getApiErrorMessage(err, "Could not review this request.")),
  });

  function openReview(request, decision) {
    setReviewError(null);
    setReviewNote("");
    setReviewing({ request, decision });
  }

  function confirmReview() {
    if (!reviewing) return;
    setReviewError(null);
    reviewMutation.mutate({ id: reviewing.request.id, decision: reviewing.decision, note: reviewNote.trim() });
  }

  const requests = requestsQuery.data?.requests ?? [];
  const loading = requestsQuery.isPending;
  const error = requestsQuery.isError
    ? getApiErrorMessage(requestsQuery.error, "Could not load payment requests.")
    : null;

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <div
          className="flex flex-wrap items-baseline justify-between"
          style={{ marginBottom: "var(--space-4)", gap: "var(--space-3)" }}
        >
          <h1 style={{ margin: 0 }}>Payment requests</h1>
          <Seg
            name="status-filter"
            aria-label="Filter by status"
            value={status}
            onChange={setStatus}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>

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
        ) : requests.length === 0 ? (
          <Card className="flex flex-col items-center text-center" style={{ padding: "var(--space-8)" }}>
            <div className="card-title">No {status.toLowerCase()} requests</div>
          </Card>
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Cycle</th>
                    <th>Note</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    {status === "Pending" && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const unused = unusedPaidTime(request);
                    return (
                    <tr key={request.id}>
                      <td>
                        <Link to={`/admin/users/${request.user.id}`}>{request.user.fullName}</Link>
                        <div className="text-xs" style={{ opacity: 0.6 }}>
                          {request.user.email}
                        </div>
                        {unused && (
                          <div
                            className="text-xs flex items-center"
                            style={{ gap: 4, color: "var(--brick)", marginTop: 2 }}
                          >
                            <AlertTriangle className="h-3 w-3" style={{ flexShrink: 0 }} />
                            Currently {unused.plan} ({formatDaysRemaining(unused.currentPeriodEnd)})
                          </div>
                        )}
                      </td>
                      <td>{request.plan}</td>
                      <td>{request.billingCycle}</td>
                      <td style={{ maxWidth: 200, overflowWrap: "break-word" }}>{request.note || "—"}</td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Tag variant={STATUS_TAG_VARIANT[request.status] || "neutral"}>{request.status}</Tag>
                      </td>
                      {status === "Pending" && (
                        <td className="flex items-center" style={{ gap: "var(--space-2)" }}>
                          <Button size="sm" variant="secondary" onClick={() => openReview(request, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => openReview(request, "Rejected")}>
                            Reject
                          </Button>
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Dialog
          open={Boolean(reviewing)}
          title={reviewing ? `${reviewing.decision} this request?` : ""}
          onClose={() => setReviewing(null)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setReviewing(null)}>
                Cancel
              </Button>
              <Button
                variant={reviewing?.decision === "Approved" ? "primary" : "danger"}
                onClick={confirmReview}
                loading={reviewMutation.isPending}
              >
                Confirm
              </Button>
            </>
          }
        >
          {reviewing && (
            <p style={{ marginBottom: "var(--space-3)" }}>
              {reviewing.decision === "Approved"
                ? `${reviewing.request.user.fullName}'s plan will be set to ${reviewing.request.plan} (${reviewing.request.billingCycle}) immediately.`
                : `${reviewing.request.user.fullName} will be notified this request wasn't approved. Their plan won't change.`}
            </p>
          )}
          {reviewing?.decision === "Approved" && unusedPaidTime(reviewing.request) && (
            <div
              className="flex items-start"
              style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              <AlertTriangle className="h-4 w-4" style={{ color: "var(--brick)", marginTop: 2, flexShrink: 0 }} />
              <p className="card-body" style={{ margin: 0, color: "var(--brick)" }}>
                {reviewing.request.user.fullName} is currently on{" "}
                {unusedPaidTime(reviewing.request).plan} with{" "}
                {formatDaysRemaining(unusedPaidTime(reviewing.request).currentPeriodEnd).toLowerCase()}.
                Approving this overwrites it immediately — the unused time isn't automatically
                refunded or credited.
              </p>
            </div>
          )}
          <Field
            id="review-note"
            label="Note to include in their email"
            optional
            placeholder={reviewing?.decision === "Rejected" ? "e.g. couldn't match this transfer to a statement entry" : "e.g. verified against statement dated..."}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
          {reviewError && (
            <p style={{ color: "var(--brick)", marginTop: "var(--space-2)" }}>{reviewError}</p>
          )}
        </Dialog>
      </main>
    </AdminLayout>
  );
}
