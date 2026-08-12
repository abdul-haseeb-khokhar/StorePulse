import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Seg from "../components/ui/Seg";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { PLANS } from "../lib/landingData";
import { CONTACT_GMAIL_URL, CONTACT_WHATSAPP, CONTACT_PHONE } from "../lib/contact";
import { BANK_NAME, BANK_ACCOUNT_TITLE, BANK_ACCOUNT_NUMBER, BANK_IBAN, formatPKR, totalForCycle, buildPaymentNoticeUrl } from "../lib/billing";

const CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function BillingPay() {
  const { plan: planId } = useParams();
  const [searchParams] = useSearchParams();
  const [cycle, setCycle] = useState(
    searchParams.get("cycle") === "yearly" ? "yearly" : "monthly",
  );

  const plan = PLANS.find((p) => p.planId === planId);

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
  });

  if (!plan) {
    return <Navigate to="/billing" replace />;
  }

  const loading = meQuery.isPending;
  const error = meQuery.isError
    ? getApiErrorMessage(meQuery.error, "Could not load your account.")
    : null;
  const email = meQuery.data?.email;
  const amount = totalForCycle(plan, cycle);

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <Link to="/billing" className="text-sm" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>
          ← Back to plans
        </Link>
        <h1 style={{ marginBottom: "var(--space-4)" }}>{plan.name} plan</h1>

        {loading ? (
          <Card>
            <Skeleton height={220} />
          </Card>
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : plan.planId === "Free" ? (
          <Card elevation="md">
            <div className="card-kicker">No payment needed</div>
            <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
              Free has no cost
            </div>
            <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
              Switching to Free doesn't need a payment — contact us and we'll move your account down whenever you're ready.
            </p>
            <div className="flex items-center" style={{ gap: "var(--space-4)" }}>
              <a href={CONTACT_GMAIL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm" style={{ gap: 6 }}>
                <Mail className="h-4 w-4 text-muted" />
                Email
              </a>
              <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm" style={{ gap: 6 }}>
                <MessageCircle className="h-4 w-4 text-muted" />
                WhatsApp
              </a>
              <a href={`tel:+${CONTACT_PHONE}`} className="flex items-center text-sm" style={{ gap: 6 }}>
                <Phone className="h-4 w-4 text-muted" />
                Call
              </a>
            </div>
          </Card>
        ) : (
          <>
            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Billing cycle</div>
              <div style={{ marginTop: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <Seg name="cycle" options={CYCLE_OPTIONS} value={cycle} onChange={setCycle} aria-label="Billing cycle" />
              </div>
              <div className="card-title" style={{ margin: 0 }}>
                {formatPKR(amount)}
              </div>
              <p className="card-body">
                {cycle === "yearly" ? "Total for 12 months, paid up front." : "Due for this month."}
              </p>
            </Card>

            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Bank transfer details</div>
              <div className="grid" style={{ gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <Field id="bankName" label="Bank" value={BANK_NAME} readOnly />
                <Field id="bankAccountTitle" label="Account title" value={BANK_ACCOUNT_TITLE} readOnly />
                <Field
                  id="bankAccountNumber"
                  label="Account number"
                  value={BANK_ACCOUNT_NUMBER}
                  readOnly
                  style={{ fontFamily: "ui-monospace,SF Mono,Menlo,monospace" }}
                />
                <Field
                  id="bankIban"
                  label="IBAN"
                  value={BANK_IBAN}
                  readOnly
                  style={{ fontFamily: "ui-monospace,SF Mono,Menlo,monospace" }}
                />
              </div>
              <p className="card-body" style={{ marginTop: "var(--space-3)" }}>
                Put <strong>{email}</strong> in the transfer note so we can match the payment to your account.
              </p>
            </Card>

            <Card>
              <div className="card-kicker">Sent the transfer?</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                Let us know
              </div>
              <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
                We'll activate your {plan.name} plan once we've verified it.
              </p>
              <a
                href={buildPaymentNoticeUrl({ planName: plan.name, cycle, amount, email })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="primary" block icon={<CheckCircle2 className="h-4 w-4" />}>
                  I've sent the payment
                </Button>
              </a>
              <p className="card-body" style={{ marginTop: "var(--space-3)" }}>
                Or reach us another way:
              </p>
              <div className="flex items-center" style={{ gap: "var(--space-4)" }}>
                <a href={CONTACT_GMAIL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm" style={{ gap: 6 }}>
                  <Mail className="h-4 w-4 text-muted" />
                  Email
                </a>
                <a href={`tel:+${CONTACT_PHONE}`} className="flex items-center text-sm" style={{ gap: 6 }}>
                  <Phone className="h-4 w-4 text-muted" />
                  Call
                </a>
              </div>
            </Card>
          </>
        )}
      </main>
    </AppLayout>
  );
}
