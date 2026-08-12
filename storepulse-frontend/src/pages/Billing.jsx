import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, ArrowRight } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { PLANS } from "../lib/landingData";
import { formatPKR } from "../lib/billing";

export default function Billing() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
  });

  const loading = meQuery.isPending;
  const error = meQuery.isError
    ? getApiErrorMessage(meQuery.error, "Could not load your account.")
    : null;
  const currentPlan = meQuery.data?.subscription?.plan || "Free";

  function choosePlan(plan) {
    const cycle = annual ? "yearly" : "monthly";
    navigate(`/billing/pay/${plan.planId}?cycle=${cycle}`);
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 1040, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-2)" }}>Billing</h1>
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
                      >
                        {plan.planId === "Free" ? "Switch to Free" : "Choose Plan"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
