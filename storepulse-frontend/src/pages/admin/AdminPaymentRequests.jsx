import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--space-4)" }}>
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
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <Link to={`/admin/users/${request.user.id}`}>{request.user.fullName}</Link>
                        <div className="text-xs" style={{ opacity: 0.6 }}>
                          {request.user.email}
                        </div>
                      </td>
                      <td>{request.plan}</td>
                      <td>{request.billingCycle}</td>
                      <td style={{ maxWidth: 200 }}>{request.note || "—"}</td>
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
                  ))}
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
