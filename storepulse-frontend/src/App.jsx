import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddSite from "./pages/AddSite";
import SiteSetup from "./pages/SiteSetup";
import SiteSettings from "./pages/SiteSettings";
import SitesList from "./pages/SitesList";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import RequireAuth from "./components/auth/RequireAuth";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sites" element={<SitesList />} />
            <Route path="/sites/new" element={<AddSite />} />
            <Route path="/sites/:siteId/setup" element={<SiteSetup />} />
            <Route path="/sites/:siteId/settings" element={<SiteSettings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
