import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ConfirmEmailChange from "./pages/ConfirmEmailChange";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddSite from "./pages/AddSite";
import SiteSetup from "./pages/SiteSetup";
import SiteSettings from "./pages/SiteSettings";
import SitesList from "./pages/SitesList";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import BillingPlan from "./pages/BillingPlan";
import BillingUsage from "./pages/BillingUsage";
import BillingHistory from "./pages/BillingHistory";
import BillingUpgrade from "./pages/BillingUpgrade";
import BillingPay from "./pages/BillingPay";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/auth/RequireAuth";
import RequireGuest from "./components/auth/RequireGuest";
import RequireAdminAuth from "./components/auth/RequireAdminAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminAcceptInvite from "./pages/admin/AdminAcceptInvite";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminSites from "./pages/admin/AdminSites";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminPaymentRequests from "./pages/admin/AdminPaymentRequests";
import AdminLogs from "./pages/admin/AdminLogs";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/docs" element={<Docs />} />

          {/* Guest-only: an active session skips straight to the dashboard.
              Landing is here too — its CTAs and pricing are for prospects,
              not signed-in users (that content is moving into the app nav). */}
          <Route element={<RequireGuest />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sites" element={<SitesList />} />
            <Route path="/sites/new" element={<AddSite />} />
            <Route path="/sites/:siteId/setup" element={<SiteSetup />} />
            <Route path="/sites/:siteId/settings" element={<SiteSettings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/plan" element={<BillingPlan />} />
            <Route path="/billing/usage" element={<BillingUsage />} />
            <Route path="/billing/history" element={<BillingHistory />} />
            <Route path="/billing/upgrade" element={<BillingUpgrade />} />
            <Route path="/billing/pay/:plan" element={<BillingPay />} />
          </Route>

          {/* Admin — no links to these from the customer-facing app; reachable only by direct URL */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/accept-invite" element={<AdminAcceptInvite />} />

          <Route element={<RequireAdminAuth />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/sites" element={<AdminSites />} />
            <Route path="/admin/payment-requests" element={<AdminPaymentRequests />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/admins" element={<AdminAdmins />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
