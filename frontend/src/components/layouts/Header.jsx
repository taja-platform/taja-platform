// src/components/layout/Header.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import api from "../../api/api";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  const handleLogout = () => {
    setShowConfirmModal(true);
    setShowDropdown(false);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmModal(false);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await api.patch("/accounts/me/", formData);
      toast.success("Profile updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error(err);
    }
  };

  return (
    <>
      {/* Header Bar */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Taja Admin Dashboard</h1>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 group"
          >
            <UserCircleIcon className="w-10 h-10 text-gray-500 group-hover:text-gray-800 transition" />
            <div className="hidden md:block text-left">
              <p className="font-semibold text-sm text-gray-800">
                {user?.first_name || user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "Admin"}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button
                onClick={handleEditClick}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <PencilSquareIcon className="w-5 h-5 mr-2 text-gray-600" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2 text-gray-600" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 🔒 Logout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
