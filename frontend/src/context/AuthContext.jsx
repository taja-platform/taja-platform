import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/accounts/me/");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user profile" + err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login/", { email, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      await fetchUserProfile();
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };


  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // 🧩 New helper: update user globally (used after editing profile)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchUserProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
