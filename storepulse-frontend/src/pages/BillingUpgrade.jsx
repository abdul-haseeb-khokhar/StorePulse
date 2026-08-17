import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import Dialog from "../components/ui/Dialog";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { PLANS } from "../lib/landingData";
import { formatPKR } from "../lib/billing";
import { formatDaysRemaining } from "../lib/plan";

// Plan changes overwrite the subscription immediately with no proration or
// refund (there's no payment processor here to prorate through) — so
// switching away from a paid plan before its period ends silently drops
// whatever was already paid for that remaining time. Same check the admin
// panel uses (AdminPaymentRequests.jsx's unusedPaidTime), mirrored here so
// the user gets the same warning before choosing, not after.
function unusedPaidTime(subscription, targetPlanId) {
  if (!subscription || subscription.plan === "Free" || subscription.plan === targetPlanId) {
    return null;
  }
  if (!subscription.currentPeriodEnd) return null;
  return new Date(subscription.currentPeriodEnd) > new Date() ? subscription : null;
}

export default function BillingUpgrade() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [annual, setAnnual] = useState(true);
  const [switchWarning, setSwitchWarning] = useState(null); // { plan, cycle, unused }
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState(null);

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
    // Overrides the app-wide default (queryClient.js disables this) — a
    // pending request's true state changes via an admin in a completely
    // different session, so refocusing this tab is the one free signal
    // that it might be worth checking again.
    refetchOnWindowFocus: true,
  });

  const loading = meQuery.isPending;
  const error = meQuery.isError
    ? getApiErrorMessage(meQuery.error, "Could not load your account.")
    : null;
  const subscription = meQuery.data?.subscription;
  const currentPlan = subscription?.plan || "Free";
  const pendingRequest = pendingRequestQuery.data;
  // Mirrors BillingPlan.jsx's own check — a cancel already scheduled from
  // there shouldn't also be offerable from here.
  const pendingCancel = subscription?.pendingPlan === "Free";

  // Free goes through the real self-service cancel (POST /billing/cancel)
  // instead of the manual/contact-us pay flow below — that's the one path
  // that actually keeps the unused paid time this page warns everyone else
  // about losing, so it gets its own mutation and dialog rather than
  // reusing switchWarning/confirmSwitch.
  const cancelMutation = useMutation({
    mutationFn: () => api.post("/billing/cancel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      setCancelOpen(false);
    },
    onError: (err) => setCancelError(getApiErrorMessage(err, "Could not cancel your plan.")),
  });

  function choosePlan(plan) {
    if (plan.planId === "Free") {
      setCancelError(null);
      setCancelOpen(true);
      return;
    }

    const cycle = annual ? "yearly" : "monthly";
    // Switching between two paid plans really does overwrite the
    // subscription immediately with no proration (setUserPlanService has
    // no concept of "the old plan's unused time") — so this warning stays
    // accurate for that case, even though it no longer applies to Free.
    const unused = unusedPaidTime(subscription, plan.planId);
    if (unused) {
      setSwitchWarning({ plan, cycle, unused });
      return;
    }
    navigate(`/billing/pay/${plan.planId}?cycle=${cycle}`);
  }

  function confirmSwitch() {
    if (!switchWarning) return;
    navigate(`/billing/pay/${switchWarning.plan.planId}?cycle=${switchWarning.cycle}`);
    setSwitchWarning(null);
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link to="/billing" className="text-sm" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>
          ← Back to Billing
        </Link>
        <h1 style={{ marginBottom: "var(--space-2)" }}>Upgrade plan</h1>
        <p className="card-body" style={{ marginBottom: "var(--space-4)" }}>
          Pick a plan and pay by bank transfer — we'll activate it once the transfer is confirmed.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "var(--space-3)" }}>
            <Skeleton height={340} />
            <Skeleton height={340} />
            <Skeleton height={340} />
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

            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-[var(--paper-card)] border border-[var(--divider-soft)]" style={{ marginBottom: "var(--space-4)" }}>
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  !annual
                    ? "bg-[var(--paper)] text-[var(--ink)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  annual
                    ? "bg-[#DDBB55]/15 text-[#DDBB55] border border-[#DDBB55]/30 shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Annual Billing
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#DDBB55] text-[#000C1A] font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {PLANS.map((plan) => {
                const price = annual ? plan.annualPricePKR : plan.monthlyPricePKR;
                const isCurrent = plan.planId === currentPlan;
                // Free never goes through a payment request (separate
                // contact-us flow below), so it's never blocked here — only
                // a paid plan other than the one already pending is locked.
                const blockedByPendingRequest =
                  Boolean(pendingRequest) &&
                  plan.planId !== "Free" &&
                  plan.planId !== pendingRequest.plan;
                // A cancel already scheduled from /billing/plan makes this
                // button redundant — same reasoning as blockedByPendingRequest
                // above, just for the other queue.
                const blockedByPendingCancel = plan.planId === "Free" && pendingCancel;

                return (
                  <Card
                    key={plan.id}
                    interactive={false}
                    className={`h-full p-6 sm:p-8 flex flex-col justify-between gap-8 rounded-2xl border transition-all duration-300 relative ${
                      plan.popular
                        ? "border-[#DDBB55] bg-[var(--paper-card)] shadow-xl"
                        : "border-[var(--divider-soft)] bg-[var(--paper-card)] shadow-sm"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#DDBB55] text-[#000C1A] border-0 shadow-md whitespace-nowrap z-10">
                        Most Popular
                      </div>
                    )}

                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-[var(--ink)]">{plan.name}</h3>
                          {isCurrent && <Tag variant="positive">Current Plan</Tag>}
                        </div>
                        <p className="text-xs text-[var(--muted)] min-h-[32px] leading-relaxed">
                          {plan.description}
                        </p>

                        <div className="pt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-[var(--ink)] font-sora">
                            {formatPKR(price)}
                          </span>
                          {price > 0 && <span className="text-xs text-[var(--muted)]">/month</span>}
                          {annual && price > 0 && (
                            <span className="text-[10px] text-[var(--muted)] ml-1 font-medium">
                              (billed annually)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[var(--divider-soft)] flex flex-col gap-3">
                        <span className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
                          Included features:
                        </span>
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[var(--muted)]">
                            <Check className="h-4 w-4 text-[#DDBB55] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isCurrent ? (
                      <Button variant="secondary" size="md" className="w-full justify-center" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant={plan.popular ? "primary" : "outline"}
                        size="md"
                        className="w-full justify-center"
                        onClick={() => choosePlan(plan)}
                        disabled={blockedByPendingRequest || blockedByPendingCancel}
                        title={
                          blockedByPendingRequest
                            ? `Wait for your pending ${pendingRequest.plan} request to be reviewed first`
                            : blockedByPendingCancel
                              ? "Your plan is already set to move to Free — see the Billing page for details"
                              : undefined
                        }
                      >
                        {blockedByPendingRequest
                          ? "Pending request in progress"
                          : blockedByPendingCancel
                            ? "Already scheduled"
                            : plan.planId === "Free"
                              ? "Switch to Free"
                              : "Choose Plan"}
                        {!blockedByPendingRequest && !blockedByPendingCancel && (
                          <ArrowRight className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <Dialog
          open={Boolean(switchWarning)}
          title={switchWarning ? `Switch to ${switchWarning.plan.name}?` : ""}
          onClose={() => setSwitchWarning(null)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setSwitchWarning(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmSwitch}>
                Continue
              </Button>
            </>
          }
        >
          {switchWarning && (
            <div className="flex items-start" style={{ gap: "var(--space-2)" }}>
              <AlertTriangle className="h-4 w-4" style={{ color: "var(--brick)", marginTop: 2, flexShrink: 0 }} />
              <p style={{ margin: 0 }}>
                You're currently on the <strong>{switchWarning.unused.plan}</strong> plan (
                {formatDaysRemaining(switchWarning.unused.currentPeriodEnd)}). Switching to{" "}
                {switchWarning.plan.name} replaces it immediately — the unused time you already
                paid for on {switchWarning.unused.plan} isn't automatically refunded or credited.
                Reach out first if you'd like that handled manually.
              </p>
            </div>
          )}
        </Dialog>

        <Dialog
          open={cancelOpen}
          title="Switch to Free?"
          onClose={() => setCancelOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setCancelOpen(false)}>
                Keep my plan
              </Button>
              <Button
                variant="danger"
                onClick={() => cancelMutation.mutate()}
                loading={cancelMutation.isPending}
              >
                Switch to Free
              </Button>
            </>
          }
        >
          <p style={{ margin: 0 }}>
            You won&apos;t lose anything you&apos;ve already paid for — {currentPlan} access stays
            active until{" "}
            {subscription?.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
              : "the end of your current period"}
            . After that, your account moves to Free automatically.
          </p>
          {cancelError && (
            <p style={{ color: "var(--brick)", marginTop: "var(--space-2)" }}>{cancelError}</p>
          )}
        </Dialog>
      </main>
    </AppLayout>
  );
}
