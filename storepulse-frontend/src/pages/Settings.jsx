import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Pencil } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import Tag from "../components/ui/Tag";
import PasswordRequirements from "../components/ui/PasswordRequirements";
import Skeleton from "../components/ui/Skeleton";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import { clearSession, getToken, saveSession } from "../lib/auth";
import { formatDaysRemaining, formatHistoryReason } from "../lib/plan";

const PLAN_TAG_VARIANT = {
  Free: "neutral",
  Pro: "accent",
  Business: "positive",
};

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function ProfileSkeleton() {
  return (
    <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
      <Skeleton width={70} height={10} style={{ marginBottom: "var(--space-2)" }} />
      <Skeleton width={160} height={22} style={{ marginBottom: "var(--space-3)" }} />
      <div className="grid" style={{ gap: "var(--space-3)" }}>
        <div>
          <Skeleton width={70} height={10} style={{ marginBottom: 5 }} />
          <Skeleton height={36} />
        </div>
        <div>
          <Skeleton width={40} height={10} style={{ marginBottom: 5 }} />
          <Skeleton height={36} />
        </div>
      </div>
    </Card>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState(null);
  const [nameFieldErrors, setNameFieldErrors] = useState({});
  const [nameSuccess, setNameSuccess] = useState(false);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailFieldErrors, setEmailFieldErrors] = useState({});
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
  });
  const user = meQuery.data ?? null;
  const loading = meQuery.isPending;
  const error = meQuery.isError
    ? getApiErrorMessage(meQuery.error, "Could not load account settings.")
    : null;

  const usageQuery = useQuery({
    queryKey: queryKeys.sites.usage,
    queryFn: async () => {
      const { data } = await api.get("/sites/usage");
      return data;
    },
  });
  const historyQuery = useQuery({
    queryKey: queryKeys.billing.history({ page: 1 }),
    queryFn: async () => {
      const { data } = await api.get("/billing/history");
      return data;
    },
  });
  const currentPlan = user?.subscription?.plan || "Free";
  const currentPeriodEnd = user?.subscription?.currentPeriodEnd;

  // Seed the editable field once on first arrival only — a background
  // revalidation of ["me"] (e.g. after the name mutation below) must not
  // stomp on text the user is actively typing.
  const hasSeededNameRef = useRef(false);
  useEffect(() => {
    if (user && !hasSeededNameRef.current) {
      setFullName(user.fullName || "");
      hasSeededNameRef.current = true;
    }
  }, [user]);

  function startEditingName() {
    setNameError(null);
    setNameFieldErrors({});
    setNameSuccess(false);
    setIsEditingName(true);
  }

  function cancelEditingName() {
    setFullName(user?.fullName || "");
    setNameError(null);
    setNameFieldErrors({});
    setIsEditingName(false);
  }

  function startEditingEmail() {
    setEmailError(null);
    setEmailFieldErrors({});
    setEmailSuccess(false);
    setNewEmail("");
    setIsEditingEmail(true);
  }

  function cancelEditingEmail() {
    setEmailError(null);
    setEmailFieldErrors({});
    setIsEditingEmail(false);
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setEmailError(null);
    setEmailFieldErrors({});
    setEmailSuccess(false);
    setEmailLoading(true);
    try {
      await api.post("/auth/me/email", { newEmail });
      setEmailSuccess(true);
      setIsEditingEmail(false);
    } catch (err) {
      const errors = getFieldErrors(err);
      setEmailFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setEmailError(getApiErrorMessage(err, "Could not request that email change."));
      }
    } finally {
      setEmailLoading(false);
    }
  }

  const nameMutation = useMutation({
    mutationFn: (nextFullName) => api.patch("/auth/me/name", { fullName: nextFullName }),
    onSuccess: (_response, nextFullName) => {
      queryClient.setQueryData(queryKeys.me, (old) => (old ? { ...old, fullName: nextFullName } : old));
      const token = getToken();
      if (token) saveSession({ token, user: queryClient.getQueryData(queryKeys.me) });
      setNameSuccess(true);
      setIsEditingName(false);
    },
    onError: (err) => {
      const errors = getFieldErrors(err);
      setNameFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setNameError(getApiErrorMessage(err, "Could not update your name."));
      }
    },
  });

  function handleNameSubmit(e) {
    e.preventDefault();
    setNameError(null);
    setNameFieldErrors({});
    setNameSuccess(false);
    nameMutation.mutate(fullName);
  }

  function openPasswordSection() {
    setPasswordError(null);
    setPasswordFieldErrors({});
    setPasswordSuccess(false);
    setIsNewPasswordFocused(false);
    setIsPasswordOpen(true);
  }

  function closePasswordSection() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError(null);
    setPasswordFieldErrors({});
    setIsNewPasswordFocused(false);
    setIsPasswordOpen(false);
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordFieldErrors({});
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordFieldErrors({ confirmNewPassword: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/auth/me/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsNewPasswordFocused(false);
      setPasswordSuccess(true);
      setIsPasswordOpen(false);
    } catch (err) {
      const errors = getFieldErrors(err);
      setPasswordFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setPasswordError(getApiErrorMessage(err, "Could not update your password."));
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  return (
    <AppLayout>
      <main
        className="mx-auto"
        style={{ maxWidth: 560, padding: "var(--space-6) var(--space-4) var(--space-8)" }}
      >
        <h1 style={{ marginBottom: "var(--space-4)" }}>Profile</h1>

        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <Card>
            <p className="card-body" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          </Card>
        ) : (
          <>
            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Account</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                {user?.fullName}
              </div>
              <form
                onSubmit={handleNameSubmit}
                className="grid"
                style={{ gap: "var(--space-3)" }}
              >
                <Field
                  id="acc-name"
                  label="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={nameFieldErrors.fullName}
                  maxLength={50}
                  readOnly={!isEditingName}
                  rightAction={
                    !isEditingName && (
                      <button
                        type="button"
                        onClick={startEditingName}
                        className="text-muted"
                        aria-label="Edit full name"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )
                  }
                  required
                />

                {nameError && (
                  <p className="text-sm" style={{ color: "var(--brick)" }}>
                    {nameError}
                  </p>
                )}
                {nameSuccess && (
                  <p className="text-sm" style={{ color: "var(--gold)" }}>
                    Name updated successfully.
                  </p>
                )}

                {isEditingName && (
                  <div className="flex" style={{ gap: "var(--space-2)" }}>
                    <Button type="submit" loading={nameMutation.isPending}>
                      Save name
                    </Button>
                    <Button type="button" variant="secondary" onClick={cancelEditingName}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>

              <form
                onSubmit={handleEmailSubmit}
                className="grid"
                style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}
              >
                <Field
                  id="acc-email"
                  label="Email"
                  type="email"
                  value={isEditingEmail ? newEmail : user?.email || ""}
                  onChange={(e) => setNewEmail(e.target.value)}
                  error={emailFieldErrors.newEmail}
                  readOnly={!isEditingEmail}
                  rightAction={
                    !isEditingEmail && (
                      <button
                        type="button"
                        onClick={startEditingEmail}
                        className="text-muted"
                        aria-label="Change email"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )
                  }
                  required
                />

                {emailError && (
                  <p className="text-sm" style={{ color: "var(--brick)" }}>
                    {emailError}
                  </p>
                )}
                {emailSuccess && (
                  <p className="text-sm" style={{ color: "var(--gold)" }}>
                    Check your new inbox to confirm the email change.
                  </p>
                )}

                {isEditingEmail && (
                  <div className="flex" style={{ gap: "var(--space-2)" }}>
                    <Button type="submit" loading={emailLoading}>
                      Save email
                    </Button>
                    <Button type="button" variant="secondary" onClick={cancelEditingEmail}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>

              {!isPasswordOpen && (
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-self-start"
                  icon={<Lock className="h-3.5 w-3.5" />}
                  onClick={openPasswordSection}
                  style={{ marginTop: "var(--space-3)" }}
                >
                  Change password
                </Button>
              )}
              {passwordSuccess && (
                <p className="text-sm" style={{ color: "var(--gold)", marginTop: "var(--space-2)" }}>
                  Password updated successfully.
                </p>
              )}
            </Card>

            {isPasswordOpen && (
              <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
                <div className="card-kicker">Security</div>
                <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                  Change password
                </div>
                <form
                  onSubmit={handlePasswordSubmit}
                  className="grid"
                  style={{ gap: "var(--space-3)" }}
                >
                  <Field
                    id="current-password"
                    label="Current password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                    error={passwordFieldErrors.currentPassword}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="text-muted"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    required
                  />

                  <Field
                    id="new-password"
                    label="New password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setIsNewPasswordFocused(true)}
                    icon={<Lock className="h-4 w-4" />}
                    error={passwordFieldErrors.newPassword}
                    maxLength={50}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="text-muted"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    required
                  />

                  <PasswordRequirements password={newPassword} visible={isNewPasswordFocused} />

                  <Field
                    id="confirm-new-password"
                    label="Confirm new password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                    error={passwordFieldErrors.confirmNewPassword}
                    maxLength={50}
                    required
                  />

                  {passwordError && (
                    <p className="text-sm" style={{ color: "var(--brick)" }}>
                      {passwordError}
                    </p>
                  )}

                  <div className="flex" style={{ gap: "var(--space-2)" }}>
                    <Button type="submit" loading={passwordLoading}>
                      Update password
                    </Button>
                    <Button type="button" variant="secondary" onClick={closePasswordSection}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card elevation="md" style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Plan</div>
              <div
                className="flex items-center"
                style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
              >
                <div className="card-title" style={{ margin: 0 }}>
                  {currentPlan} plan
                </div>
                <Tag variant={PLAN_TAG_VARIANT[currentPlan] || "neutral"}>
                  {user?.subscription?.status || "Active"}
                </Tag>
              </div>
              {currentPeriodEnd && (
                <p className="card-body" style={{ marginBottom: "var(--space-3)" }}>
                  {formatDaysRemaining(currentPeriodEnd)}
                </p>
              )}

              {usageQuery.isPending ? (
                <Skeleton height={50} style={{ marginBottom: "var(--space-3)" }} />
              ) : usageQuery.isError ? null : usageQuery.data.sites.length === 0 ? (
                <p className="card-body" style={{ opacity: 0.6, marginBottom: "var(--space-3)" }}>
                  Add a site to start tracking usage.
                </p>
              ) : (
                <div className="grid" style={{ gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                  {usageQuery.data.sites.map((site) => {
                    const limit = usageQuery.data.maxMonthlyEvents;
                    // null means unlimited (see sites.service.js's getUsageSummary —
                    // JSON has no Infinity, so "no limit" has to be an explicit null).
                    const pct = limit === null ? null : Math.min(100, (site.eventsThisMonth / limit) * 100);
                    return (
                      <div key={site.siteId}>
                        <div className="flex items-center justify-between text-sm">
                          <span>{site.name}</span>
                          <span className="text-muted">
                            {formatNumber(site.eventsThisMonth)} / {limit === null ? "Unlimited" : formatNumber(limit)} events this month
                          </span>
                        </div>
                        {pct !== null && (
                          <div
                            style={{
                              height: 4,
                              borderRadius: 999,
                              background: "var(--divider-soft)",
                              marginTop: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: pct >= 100 ? "var(--brick)" : "var(--stamp)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Link to="/billing">
                <Button variant="secondary">Manage billing</Button>
              </Link>
            </Card>

            <Card style={{ marginBottom: "var(--space-3)" }}>
              <div className="card-kicker">Billing history</div>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
                Past changes
              </div>
              {historyQuery.isPending ? (
                <Skeleton height={70} />
              ) : historyQuery.isError ? null : historyQuery.data.entries.length === 0 ? (
                <p className="card-body" style={{ opacity: 0.6 }}>
                  No billing history yet.
                </p>
              ) : (
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
                      {historyQuery.data.entries.map((entry) => (
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
              )}
            </Card>
          </>
        )}

        <Card>
          <div className="card-kicker">Session</div>
          <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>
            Log out
          </div>
          <p className="card-body">You&apos;ll need to log in again to access your dashboard.</p>
          <Button variant="secondary" onClick={() => setConfirmLogoutOpen(true)}>
            Log out
          </Button>
        </Card>

        <Dialog
          open={confirmLogoutOpen}
          title="Log out?"
          onClose={() => setConfirmLogoutOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setConfirmLogoutOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                Log out
              </Button>
            </>
          }
        >
          You&apos;ll be signed out of StorePulse on this device.
        </Dialog>
      </main>
    </AppLayout>
  );
}
