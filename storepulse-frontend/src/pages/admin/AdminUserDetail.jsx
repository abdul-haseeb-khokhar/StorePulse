import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import Card from "../../components/ui/Card";
import Tag from "../../components/ui/Tag";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import Skeleton from "../../components/ui/Skeleton";
import Seg from "../../components/ui/Seg";
import adminApi from "../../lib/adminApi";
import { getApiErrorMessage } from "../../lib/api";
import { queryKeys } from "../../lib/queryKeys";
import { formatDaysRemaining } from "../../lib/plan";

const STATUS_TAG_VARIANT = {
  Active: "positive",
  Inactive: "neutral",
  Banned: "negative",
  Deleted: "outline",
};

const PLAN_TAG_VARIANT = {
  Free: "neutral",
  Pro: "accent",
  Business: "positive",
};

const PLAN_OPTIONS = [
  { value: "Free", label: "Free" },
  { value: "Pro", label: "Pro" },
  { value: "Business", label: "Business" },
];

// Free has no period to renew, so this only ever shows for Pro/Business.
// The server computes the actual currentPeriodEnd from whichever of these
// is picked — no date ever passes through the client.
const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const ACTION_COPY = {
  Active: (name) => `${name} will be able to log in as an active user.`,
  Banned: (name) => `${name} will immediately lose access to their account.`,
  Deleted: (name) => `${name}'s email will be anonymized and their account permanently locked. This can't be undone.`,
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [planDraft, setPlanDraft] = useState(null);
  const [cycleDraft, setCycleDraft] = useState("monthly");
  const [planError, setPlanError] = useState(null);
  const [planSuccess, setPlanSuccess] = useState(null);

  const userQuery = useQuery({
    queryKey: queryKeys.admin.users.detail(id),
    queryFn: async () => {
      const { data } = await adminApi.get(`/admin/users/${id}`);
      return data.user;
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => adminApi.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setPendingStatus(null);
    },
    onError: (err) => setActionError(getApiErrorMessage(err, "Could not update this user's status.")),
  });

  const planMutation = useMutation({
    mutationFn: ({ plan, billingCycle }) =>
      adminApi.patch(`/admin/users/${id}/plan`, {
        plan,
        ...(plan !== "Free" ? { billingCycle } : {}),
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(id) });
      setPlanError(null);
      setPlanSuccess(data.message);
    },
    onError: (err) => {
      setPlanSuccess(null);
      setPlanError(getApiErrorMessage(err, "Could not update this user's plan."));
    },
  });

  const user = userQuery.data;
  const loading = userQuery.isPending;
  const error = userQuery.isError
    ? getApiErrorMessage(userQuery.error, "Could not load this user.")
    : null;

  const currentPlan = user?.subscription?.plan || "Free";
  const activePlanDraft = planDraft ?? currentPlan;

  function openAction(nextStatus) {
    setActionError(null);
    setPendingStatus(nextStatus);
  }

  function confirmAction() {
    if (!pendingStatus) return;
    setActionError(null);
    statusMutation.mutate(pendingStatus);
  }

  function submitPlan() {
    setPlanError(null);
    setPlanSuccess(null);
    planMutation.mutate({ plan: activePlanDraft, billingCycle: cycleDraft });
  }

  function selectPlanDraft(nextPlan) {
    setPlanSuccess(null);
    setPlanDraft(nextPlan);
  }

  function selectCycleDraft(nextCycle) {
    setPlanSuccess(null);
    setCycleDraft(nextCycle);
  }

  return (
    <AdminLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 720, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link
          to="/admin/users"
          className="flex items-center text-sm"
          style={{ gap: 6, marginBottom: "var(--space-3)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>

        {loading ? (
          <Card>
            <Skeleton height={160} />
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <>
            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">{user.email}</div>
              <div
                className="flex items-center"
                style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
              >
                <div className="card-title" style={{ margin: 0 }}>
                  {user.fullName}
                </div>
                <Tag variant={STATUS_TAG_VARIANT[user.status] || "neutral"}>{user.status}</Tag>
              </div>
              <p className="card-body">
                {user.isEmailVerified ? "Email verified" : "Email not verified"} · Joined{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>

              <div
                className="flex items-center"
                style={{ gap: "var(--space-2)", marginTop: "var(--space-3)" }}
              >
                {user.status !== "Active" && user.status !== "Deleted" && (
                  <Button variant="secondary" onClick={() => openAction("Active")}>
                    Activate
                  </Button>
                )}
                {user.status !== "Banned" && user.status !== "Deleted" && (
                  <Button variant="danger" onClick={() => openAction("Banned")}>
                    Ban
                  </Button>
                )}
                {user.status !== "Deleted" && (
                  <Button variant="danger" onClick={() => openAction("Deleted")}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>

            <Card style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Plan</div>
              <div
                className="flex items-center"
                style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
              >
                <div className="card-title" style={{ margin: 0 }}>
                  Current: {currentPlan}
                </div>
                <Tag variant={PLAN_TAG_VARIANT[currentPlan] || "neutral"}>
                  {user.subscription?.status || "Active"}
                </Tag>
              </div>
              {user.subscription?.currentPeriodEnd && (
                <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
                  {formatDaysRemaining(user.subscription.currentPeriodEnd)}
                </p>
              )}

              <Seg
                name="plan"
                options={PLAN_OPTIONS}
                value={activePlanDraft}
                onChange={selectPlanDraft}
                aria-label="Select plan"
              />

              {activePlanDraft !== "Free" && (
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Seg
                    name="billing-cycle"
                    options={BILLING_CYCLE_OPTIONS}
                    value={cycleDraft}
                    onChange={selectCycleDraft}
                    aria-label="Billing cycle"
                  />
                </div>
              )}

              {planError && (
                <p className="card-body" style={{ color: "var(--brick)", marginTop: "var(--space-2)" }}>
                  {planError}
                </p>
              )}
              {planSuccess && (
                <p className="card-body" style={{ color: "var(--gold)", marginTop: "var(--space-2)" }}>
                  {planSuccess}
                </p>
              )}

              <Button
                variant="primary"
                style={{ marginTop: "var(--space-3)" }}
                onClick={submitPlan}
                loading={planMutation.isPending}
              >
                Update plan
              </Button>
            </Card>

            <Card>
              <div className="card-kicker">Sites</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                {user.sites.length} connected site{user.sites.length === 1 ? "" : "s"}
              </div>
              {user.sites.length === 0 ? (
                <p className="card-body" style={{ opacity: 0.6 }}>
                  No sites yet.
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Domain</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.sites.map((site) => (
                        <tr key={site.id}>
                          <td>{site.name}</td>
                          <td>{site.domain}</td>
                          <td>{new Date(site.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        <Dialog
          open={Boolean(pendingStatus)}
          title={pendingStatus ? `${pendingStatus} this user?` : ""}
          onClose={() => setPendingStatus(null)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setPendingStatus(null)}>
                Cancel
              </Button>
              <Button
                variant={pendingStatus === "Active" ? "primary" : "danger"}
                onClick={confirmAction}
                loading={statusMutation.isPending}
              >
                Confirm
              </Button>
            </>
          }
        >
          {pendingStatus && user && (
            <p style={{ marginBottom: "var(--space-2)" }}>
              {ACTION_COPY[pendingStatus](user.fullName)}
            </p>
          )}
          {actionError && <p style={{ color: "var(--brick)" }}>{actionError}</p>}
        </Dialog>
      </main>
    </AdminLayout>
  );
}
