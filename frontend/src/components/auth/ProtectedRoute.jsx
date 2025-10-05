// src/components/auth/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { user } = useContext(AuthContext);

  // Still checking (optional loading state)
  if (user === null) {
    const token = localStorage.getItem("access");
    if (!token) return <Navigate to="/login" replace />;
  }

  // If not logged in, redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render nested routes
  return <Outlet />;
}
