import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layers, Gauge, History as HistoryIcon, ArrowUpCircle, Clock, ChevronRight } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { formatDaysRemaining } from "../lib/plan";

const PLAN_TAG_VARIANT = {
  Free: "neutral",
  Pro: "accent",
  Business: "positive",
};

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

/**
 * Billing — landing hub for everything billing-related, previously
 * scattered across this page (just the plan picker) and the Profile page
 * (usage + billing history buried under a Plan card). Each card below owns
 * one concern and links to its own page; this page itself just previews
 * them, reusing the same queries those pages need anyway so navigating
 * into one is instant (TanStack Query serves the already-cached data
 * within its staleTime).
 */
export default function Billing() {
  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
  });

  const pendingRequestQuery = useQuery({
    queryKey: queryKeys.billing.paymentRequests({ status: "Pending" }),
    queryFn: async () => {
      const { data } = await api.get("/billing/payment-requests");
      return data.requests.find((r) => r.status === "Pending") || null;
    },
    refetchOnWindowFocus: true,
  });

  const usageQuery = useQuery({
    queryKey: queryKeys.sites.usage,
    queryFn: async () => {
      const { data } = await api.get("/sites/usage");
      return data;
    },
  });

  // Same {page:1, limit:20} shape BillingHistory.jsx defaults to — matching
  // it means this preview fetch primes the exact cache entry that page
  // reads on arrival, not just a similar one, so the card→page nav is
  // actually instant instead of re-fetching under a different key.
  const historyQuery = useQuery({
    queryKey: queryKeys.billing.history({ page: 1, limit: 20 }),
    queryFn: async () => {
      const { data } = await api.get("/billing/history", { params: { page: 1, limit: 20 } });
      return data;
    },
  });

  const loading = meQuery.isPending;
  const error = meQuery.isError
    ? getApiErrorMessage(meQuery.error, "Could not load your account.")
    : null;
  const subscription = meQuery.data?.subscription;
  const currentPlan = subscription?.plan || "Free";
  const pendingCancel = subscription?.pendingPlan === "Free";
  const pendingRequest = pendingRequestQuery.data;

  const totalEventsThisMonth = usageQuery.data?.sites?.reduce(
    (sum, site) => sum + (site.eventsThisMonth || 0),
    0,
  );

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-2)" }}>Billing</h1>
        <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
          Your plan, usage, and payment history in one place.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--space-3)" }}>
            <Skeleton height={130} />
            <Skeleton height={130} />
            <Skeleton height={130} />
            <Skeleton height={130} />
          </div>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <>
            {pendingRequest && (
              <Card
                elevation="sm"
                style={{ marginBottom: "var(--space-4)", borderColor: "var(--stamp)" }}
              >
                <div className="flex items-start" style={{ gap: "var(--space-2)" }}>
                  <Clock className="h-4 w-4" style={{ color: "var(--stamp)", marginTop: 2 }} />
                  <p className="card-body" style={{ margin: 0 }}>
                    Your request for the <strong>{pendingRequest.plan}</strong> plan (
                    {pendingRequest.billingCycle}) is waiting for review. We'll activate it once
                    the transfer is confirmed — no need to submit it again.
                  </p>
                </div>
              </Card>
            )}

            {pendingCancel && subscription?.currentPeriodEnd && (
              <Card elevation="sm" style={{ marginBottom: "var(--space-4)" }}>
                <p className="card-body" style={{ margin: 0 }}>
                  Your plan is set to move to <strong>Free</strong> on{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()} (
                  {formatDaysRemaining(subscription.currentPeriodEnd)}). You'll keep {currentPlan}{" "}
                  access until then.
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--space-3)" }}>
              <Card as={Link} to="/billing/plan" interactive elevation="md">
                <div className="flex items-center justify-between">
                  <div className="card-kicker flex items-center" style={{ gap: 6 }}>
                    <Layers className="h-3.5 w-3.5" />
                    Plan
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: "var(--space-2)", marginTop: "var(--space-2)" }}
                >
                  <div className="card-title" style={{ margin: 0 }}>
                    {currentPlan}
                  </div>
                  <Tag variant={PLAN_TAG_VARIANT[currentPlan] || "neutral"}>
                    {subscription?.status || "Active"}
                  </Tag>
                </div>
                {subscription?.currentPeriodEnd && (
                  <p className="card-body" style={{ marginTop: "var(--space-1)" }}>
                    {formatDaysRemaining(subscription.currentPeriodEnd)}
                  </p>
                )}
              </Card>

              <Card as={Link} to="/billing/usage" interactive elevation="md">
                <div className="flex items-center justify-between">
                  <div className="card-kicker flex items-center" style={{ gap: 6 }}>
                    <Gauge className="h-3.5 w-3.5" />
                    Usage
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </div>
                <p className="card-body" style={{ marginTop: "var(--space-2)" }}>
                  {usageQuery.isPending
                    ? "…"
                    : usageQuery.isError
                      ? "Could not load usage"
                      : `${formatNumber(totalEventsThisMonth)} events tracked this month`}
                </p>
              </Card>

              <Card as={Link} to="/billing/history" interactive elevation="md">
                <div className="flex items-center justify-between">
                  <div className="card-kicker flex items-center" style={{ gap: 6 }}>
                    <HistoryIcon className="h-3.5 w-3.5" />
                    Billing history
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </div>
                <p className="card-body" style={{ marginTop: "var(--space-2)" }}>
                  {historyQuery.isPending
                    ? "…"
                    : historyQuery.isError
                      ? "Could not load history"
                      : historyQuery.data.total === 0
                        ? "No changes yet"
                        : `${historyQuery.data.total} change${historyQuery.data.total === 1 ? "" : "s"} recorded`}
                </p>
              </Card>

              <Card as={Link} to="/billing/upgrade" interactive elevation="md">
                <div className="flex items-center justify-between">
                  <div className="card-kicker flex items-center" style={{ gap: 6 }}>
                    <ArrowUpCircle className="h-3.5 w-3.5" />
                    Upgrade plan
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </div>
                <p className="card-body" style={{ marginTop: "var(--space-2)" }}>
                  Compare Free, Pro, and Business and switch anytime.
                </p>
              </Card>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
