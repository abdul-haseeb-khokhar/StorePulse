import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Pencil } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import PasswordRequirements from "../components/ui/PasswordRequirements";
import api, { getApiErrorMessage, getFieldErrors } from "../lib/api";
import { clearSession, getToken, saveSession } from "../lib/auth";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [nameFieldErrors, setNameFieldErrors] = useState({});
  const [nameSuccess, setNameSuccess] = useState(false);

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

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const { data } = await api.get("/auth/me");
        if (!ignore) {
          setUser(data.user);
          setFullName(data.user.fullName || "");
        }
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, "Could not load account settings."));
      }
    }

    loadUser();
    return () => {
      ignore = true;
    };
  }, []);

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

  async function handleNameSubmit(e) {
    e.preventDefault();
    setNameError(null);
    setNameFieldErrors({});
    setNameSuccess(false);
    setNameLoading(true);
    try {
      await api.patch("/auth/me/name", { fullName });
      const updatedUser = { ...user, fullName };
      setUser(updatedUser);
      const token = getToken();
      if (token) saveSession({ token, user: updatedUser });
      setNameSuccess(true);
      setIsEditingName(false);
    } catch (err) {
      const errors = getFieldErrors(err);
      setNameFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setNameError(getApiErrorMessage(err, "Could not update your name."));
      }
    } finally {
      setNameLoading(false);
    }
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

        {error ? (
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
                {user?.fullName || "Loading…"}
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
                <Field id="acc-email" label="Email" value={user?.email || ""} readOnly />

                {!isPasswordOpen && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-self-start"
                    icon={<Lock className="h-3.5 w-3.5" />}
                    onClick={openPasswordSection}
                  >
                    Change password
                  </Button>
                )}
                {passwordSuccess && (
                  <p className="text-sm" style={{ color: "var(--gold)" }}>
                    Password updated successfully.
                  </p>
                )}

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
                    <Button type="submit" loading={nameLoading}>
                      Save name
                    </Button>
                    <Button type="button" variant="secondary" onClick={cancelEditingName}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
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
