import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Layouts
import DashboardLayout from "./components/layouts/DashboardLayout";

// Pages
import LoginPage from "./pages/Login";
import HomePage from "./pages/HomePage";
import AgentsPage from "./pages/AgentsPage";
import ShopsPage from "./pages/ShopsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AgentDashboard from "./pages/AgentDashboard";

// Auth
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentHomePage from "./pages/AgentHomePage";

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            {/* <Route path="settings" element={<DashboardSettings />} />
            <Route path="profile" element={<DashboardProfile />} /> */}
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/shops" element={<ShopsPage />} />
          </Route>
          <Route path="/agent" element={<AgentHomePage />} />
          <Route path="/agent/analytics" element={<AgentDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
