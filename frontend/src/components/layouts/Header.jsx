// src/components/layout/Header.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogout = () => {
    setShowConfirmModal(true);
    setShowDropdown(false);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* Header Bar */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Taja Admin Dashboard</h1>
        </div>

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

      {/* Logout Confirmation Modal */}
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
    </>
  );
}
