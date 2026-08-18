import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpCircle } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import Dialog from "../components/ui/Dialog";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { formatDaysRemaining } from "../lib/plan";

const PLAN_TAG_VARIANT = {
  Free: "neutral",
  Pro: "accent",
  Business: "positive",
};

export default function BillingPlan() {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post("/billing/cancel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      setCancelOpen(false);
    },
    onError: (err) => setCancelError(getApiErrorMessage(err, "Could not cancel your plan.")),
  });

  const loading = meQuery.isPending;
  const error = meQuery.isError
    ? getApiErrorMessage(meQuery.error, "Could not load your account.")
    : null;
  const subscription = meQuery.data?.subscription;
  const currentPlan = subscription?.plan || "Free";
  const pendingCancel = subscription?.pendingPlan === "Free";

  function openCancel() {
    setCancelError(null);
    setCancelOpen(true);
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link to="/billing" className="text-sm" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>
          ← Back to Billing
        </Link>
        <h1 style={{ marginBottom: "var(--space-4)" }}>Your plan</h1>

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
            <div className="card-kicker">Current plan</div>
            <div
              className="flex items-center"
              style={{ gap: "var(--space-2)", marginTop: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              <div className="card-title" style={{ margin: 0 }}>
                {currentPlan} plan
              </div>
              <Tag variant={PLAN_TAG_VARIANT[currentPlan] || "neutral"}>
                {subscription?.status || "Active"}
              </Tag>
            </div>

            {subscription?.currentPeriodEnd && (
              <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
                {formatDaysRemaining(subscription.currentPeriodEnd)}
              </p>
            )}

            {pendingCancel && subscription?.currentPeriodEnd && (
              <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
                Your plan is set to move to <strong>Free</strong> on{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. Changed your mind?
                Reach out and we can undo it.
              </p>
            )}

            <div className="flex flex-wrap" style={{ gap: "var(--space-2)" }}>
              <Link to="/billing/upgrade">
                <Button variant="secondary" icon={<ArrowUpCircle className="h-4 w-4" />}>
                  {currentPlan === "Free" ? "Choose a plan" : "Change plan"}
                </Button>
              </Link>
              {currentPlan !== "Free" && !pendingCancel && (
                <Button variant="ghost" onClick={openCancel}>
                  Cancel plan
                </Button>
              )}
            </div>
          </Card>
        )}

        <Dialog
          open={cancelOpen}
          title="Cancel your plan?"
          onClose={() => setCancelOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setCancelOpen(false)}>
                Keep my plan
              </Button>
              <Button variant="danger" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
                Cancel plan
              </Button>
            </>
          }
        >
          <p style={{ marginBottom: "var(--space-2)" }}>
            You won't lose anything you've already paid for — {currentPlan} access stays active
            until{" "}
            {subscription?.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
              : "the end of your current period"}
            . After that, your account moves to Free automatically.
          </p>
          {cancelError && <p style={{ color: "var(--brick)" }}>{cancelError}</p>}
        </Dialog>
      </main>
    </AppLayout>
  );
}
