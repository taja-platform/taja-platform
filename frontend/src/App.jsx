// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Layouts
import DashboardLayout from "./components/layouts/DashboardLayout";

// Pages
import LoginPage from "./pages/Login";
import AgentsPage from "./pages/admin/AgentsPage";
import ShopsPage from "./pages/admin/ShopsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AgentDashboard from "./pages/agent/AgentDashboard";



// Auth

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentHomePage from "./pages/agent/AgentHomePage";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect";




function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>

          <Route path="/" element={<RoleBasedRedirect />} /> 
          
          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
          
          {/* General Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/shops" element={<ShopsPage />} />
          </Route>
          
          {/* Agent Routes */}
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