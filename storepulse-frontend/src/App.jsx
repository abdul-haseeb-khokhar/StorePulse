import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddSite from "./pages/AddSite";
import SiteSetup from "./pages/SiteSetup";
import SitesList from "./pages/SitesList";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App (TODO: wrap these in a real auth guard once JWT auth exists) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sites" element={<SitesList />} />
        <Route path="/sites/new" element={<AddSite />} />
        <Route path="/sites/:siteId/setup" element={<SiteSetup />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
