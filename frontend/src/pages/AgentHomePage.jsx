import { useContext, useState } from "react";
import { ShopFormModal } from "../components/ShopFormModal";
import { toast } from "sonner";
import api from "../api/api";
import {
  ChartColumnBig,
  LogOut,
  MapPin,
  MenuIcon,
  Plus,
  StoreIcon,
  User,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AgentHomePage() {
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [view, setView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmModal(false);
  };

  const handleSaveShop = async (formDataPayload, shopId = null) => {
    const isUpdating = !!shopId;

    try {
      if (isUpdating) {
        await api.patch(`/shops/${shopId}/`, formDataPayload);
      } else {
        await api.post("/shops/", formDataPayload);
      }

      toast.success(`Shop ${isUpdating ? "updated" : "added"} successfully!`);
    } catch (error) {
      let errorMessage = `Failed to ${isUpdating ? "update" : "add"} shop.`;
      if (error.response?.data) {
        const details = Object.entries(error.response.data)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          )
          .join(" | ");
        errorMessage = `${errorMessage} Details: ${details}`;
      }

      toast.error(errorMessage);
    }
    setShowAddShopModal(false);
  };

  const LayoutDashboard = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );

  const Store = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2a2 2 0 012 2v2M7 21h10a2 2 0 002-2v-6m-4 0v-2"
      />
    </svg>
  );

  const NavItem = ({ icon: Icon, title, isActive, onClick }) => (
    <a
      href="#"
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-gray-800 text-white shadow-md"
          : "text-gray-400 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span className="font-medium">{title}</span>
    </a>
  );

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { title: "Analytics", icon: ChartColumnBig, view: "analytics" },
    { title: "Shop Management", icon: Store, view: "shops" },
    { title: "My Profile", icon: User, view: "profile" },
  ];

  const handleBackdropClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans flex">
        <header className="fixed top-0 left-0 right-0 md:hidden z-40 bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Agent Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-700 rounded-lg hover:bg-gray-200"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </header>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
            onClick={handleBackdropClick}
          ></div>
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out h-screen overflow-y-hidden 
                    md:translate-x-0 md:flex-shrink-0
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="text-white text-2xl font-extrabold mb-8 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-green-400" />
              <span>Agent Portal</span>
            </div>

            <nav className="flex-grow space-y-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.view}
                  icon={item.icon}
                  title={item.title}
                  isActive={view === item.view}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/agent/analytics?view=${item.view}`);
                  }}
                />
              ))}
            </nav>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 p-3 text-white">
                <User className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm font-semibold">
                    {user?.user?.first_name || user?.username || "User"}{" "}
                    {user?.user?.last_name || user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-400">{user.agent_id}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-grow p-4 md:p-8 pt-20 md:pt-8 md:ml-64 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center">
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
                  <StoreIcon className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Welcome, Agent{" "}
                {user?.user?.first_name || user?.username || "User"}!
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-md mx-auto">
                Get started by adding your first shop
              </p>

              {/* Button */}
              <button
                onClick={() => setShowAddShopModal(true)}
                className="px-10 py-5 bg-gray-900 text-white font-semibold text-lg rounded-full shadow-xl transform transition-all duration-300 hover:bg-gray-800 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50 inline-flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Add New Shop
              </button>

              {/* Minimal hint text */}
              <p className="text-gray-400 text-sm mt-8">
                Your shops will appear here once added
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="fixed bottom-8 right-8 opacity-5 pointer-events-none">
            <StoreIcon className="w-64 h-64 text-gray-900" />
          </div>

          {showAddShopModal && (
            <ShopFormModal
              onClose={() => setShowAddShopModal(false)}
              onSave={handleSaveShop}
            />
          )}
        </main>
      </div>

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
