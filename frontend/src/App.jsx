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

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/shops" element={<ShopsPage />} />
          </Route>
          <Route path="/agent" element={<AgentDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
