import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layout Component
import DashboardLayout from './components/layouts/DashboardLayout';

// Page Components
import LoginPage from './pages/Login';
import HomePage from './pages/HomePage';
import AgentsPage from './pages/AgentsPage';
import ShopsPage from './pages/ShopsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Route: Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes: Dashboard and its children */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/shops" element={<ShopsPage />} />
        </Route>

        {/* Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
