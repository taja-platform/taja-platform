import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";
import {
  X,
  User,
  MapPin,
  LogOut,
  Menu as MenuIcon,
  Plus,
  ChartColumnBig,
} from "lucide-react";

import api from "../api/api";
import { ShopInfoModal } from "../components/ShopInfoModal";
import { ShopCard } from "../components/ShopCard";
import { ShopFormModal } from "../components/ShopFormModal";
import { Input } from "../components/utils/Input";
import { Textarea } from "../components/utils/Textarea";
import { Navigate, useLocation } from "react-router-dom";

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

const ProfileEditor = ({ profile, updateUser }) => {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ CORRECTED: Send a FLAT payload to match AgentSerializer
      const payload = {
        first_name: formData.first_name, // Flat field
        last_name: formData.last_name, // Flat field
        email: formData.email, // Flat field
        phone_number: formData.phone_number,
        address: formData.address,
        state: formData.state,
      };

      const res = await api.patch(`/accounts/me/`, payload);

      toast.success("Details updated successfulljy!");

      updateUser(res.data); // Update context with new user data
    } catch (err) {
      // ✅ ADD THIS LOGGING BLOCK
      console.error("--- FULL API ERROR RESPONSE ---");
      if (err.response) {
        // This will print the exact validation error from Django
        console.error("Data:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Error:", err.message);
      }
      console.error("-----------------------------");

      toast.error(
        err.response?.data?.detail ||
          "Failed to update agent. Check console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setIsPasswordLoading(true);

    try {
      const payload = {
        password: passwordData.new,
        current_password: passwordData.current,
      };

      const response = await api.patch("/accounts/me/", payload);
      response && toast.success("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("--- FULL API ERROR RESPONSE ---");
      if (err.response) {
        console.error("Data:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Error:", err.message);
      }
      console.error("-----------------------------");
      toast.error(
        err.response?.data?.detail ||
          "Failed to change password. Check console for details."
      );
    } finally {
      setIsPasswordLoading(false);
      setFormData({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="space-y-8">
      {/* General Information Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Agent Information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <Input
            id="agent_id"
            label="Agent ID"
            type="text"
            value={formData.agent_id}
            readOnly
          />
          <Input
            id="firsrt_name"
            name="first_name"
            label="First Name"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <Input
            id="last_name"
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            type="text"
            required
          />
          <Input
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            readOnly
            required
          />
          <Input
            id="phone_number"
            name="phone_number"
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
          />
          <Textarea
            id="address"
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-6 h-12 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <span>Update Profile</span>
            )}
          </button>
        </form>
      </div>

      {/* Password Management Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Input
            id="current"
            name="current"
            label="Current Password"
            type="password"
            value={passwordData.current}
            onChange={handlePasswordChange}
            required
          />
          <Input
            id="new"
            name="new"
            label="New Password"
            type="password"
            value={passwordData.new}
            onChange={handlePasswordChange}
            required
          />
          <Input
            id="confirm"
            name="confirm"
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm}
            onChange={handlePasswordChange}
            required
          />

          <button
            type="submit"
            disabled={isPasswordLoading}
            className="w-full md:w-auto px-6 h-12 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
          >
            {isPasswordLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              <span>Change Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardView = ({ totalShops, shopsToday }) => {
  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );

  const ActivityItem = ({ title, time, icon: Icon, color }) => (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
      <div className={`p-2 rounded-lg ${color} text-white flex-shrink-0`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-grow">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Taja Agent Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Shops Added Today"
          value={shopsToday}
          icon={Plus}
          color="bg-gray-900"
        />
        <Card
          title="Total Shops Captured"
          value={totalShops}
          icon={Store}
          color="bg-green-600"
        />
        <Card
          title="Profile Completion"
          value="90%"
          icon={User}
          color="bg-indigo-600"
        />
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">
          Recent Shop Activity
        </h2>
        <div className="divide-y divide-gray-100">
          <ActivityItem
            title="New shop 'Tech Repair Hub' added."
            time="5 minutes ago"
            icon={MapPin}
            color="bg-blue-500"
          />
          <ActivityItem
            title="Updated coordinates for 'QuickStop Groceries'."
            time="2 hours ago"
            icon={MapPin}
            color="bg-yellow-500"
          />
          <ActivityItem
            title="Completed profile update."
            time="Yesterday"
            icon={User}
            color="bg-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

const AgentDashboard = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const [view, setView] = useState(params.get("view") || "dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const [isShopsLoading, setIsShopsLoading] = useState(true);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const { user, logout, updateUser } = useContext(AuthContext);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [profile, setProfile] = useState({
    agent_id: user?.agent_id || "AGT0042",
    first_name: user?.user.first_name || "g",
    last_name: user?.user.last_name || "",
    email: user?.user.email || "",
    phone_number: user?.phone_number || "555-0199",
    address: user?.address || "123 Main St, Anytown, State 90210",
    state: user?.state || "California",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        agent_id: user?.agent_id || "AGT0042",
        first_name: user?.user?.first_name || "g",
        last_name: user?.user?.last_name || "",
        email: user?.user?.email || "",
        phone_number: user?.phone_number || "555-0199",
        address: user?.address || "123 Main St, Anytown, State 90210",
        state: user?.state || "California",
      });
    }
  }, [user]);

  const fetchShops = useCallback(async () => {
    setIsShopsLoading(true);
    try {
      const response = await api.get("/shops/my-shops/");
      setShops(response.data);
      toast.success(`Successfully loaded ${response.data.length} shops.`);
    } catch (error) {
      toast.error("Failed to load shops. Please try again.");
      console.error("Error fetching shops:", error);
      setShops([]);
    } finally {
      setIsShopsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmModal(false);
  };

  const today = new Date().toISOString().split("T")[0];

  const shopsTodayCount = shops.filter((shop) => {
    const shopDate = new Date(shop.date_created).toISOString().split("T")[0];
    return shopDate === today;
  }).length;

  const handleProfileSave = (newProfileData) => {
    setProfile(newProfileData);
  };

  const handleSaveShop = async (formDataPayload, shopId = null) => {
    setShopModalOpen(false);
    setCurrentShop(null);

    const isUpdating = !!shopId;

    try {
      if (isUpdating) {
        await api.patch(`/shops/${shopId}/`, formDataPayload);
      } else {
        await api.post("/shops/", formDataPayload);
      }

      toast.success(`Shop ${isUpdating ? "updated" : "added"} successfully!`);
      await fetchShops();
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
  };

  const openAddShopModal = () => {
    setCurrentShop(null);
    setShopModalOpen(true);
  };

  const openEditShopModal = (shop) => {
    setCurrentShop(shop);
    setShopModalOpen(true);
  };

  const openInfoModal = (shop) => {
    setCurrentShop(shop);
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setCurrentShop(null);
    setShowInfoModal(false);
  };

  const renderView = () => {
    switch (view) {
      case "analytics":
        return (
          <DashboardView
            totalShops={shops.length}
            shopsToday={shopsTodayCount}
          />
        );
      case "profile":
        return (
          <ProfileEditor
            profile={profile}
            onSave={handleProfileSave}
            user={user}
            updateUser={updateUser}
          />
        );
      case "shops":
        return (
          <ShopsManager
            shops={shops}
            onAdd={openAddShopModal}
            onEdit={openEditShopModal}
            onView={openInfoModal}
            isLoading={isShopsLoading}
          />
        );
      case "dashboard":
      default:
        return <Navigate to={"/agent"} />;
    }
  };

  const ShopsManager = ({ shops, onAdd, onEdit, onView, isLoading }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New Shop</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
          <div className="w-10 h-10 border-4 border-gray-900/30 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shops...</p>
        </div>
      )}

      {!isLoading && shops.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onEdit={onEdit}
              onView={onView}
            />
          ))}
        </div>
      )}

      {!isLoading && shops.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            No shops added yet. Start by adding your first shop!
          </p>
        </div>
      )}
    </div>
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
                    setView(item.view);
                    setIsSidebarOpen(false);
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

        <main
          className={`flex-grow p-4 md:p-8 pt-20 md:pt-8 md:ml-64 transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto py-4">{renderView()}</div>
        </main>

        {shopModalOpen && (
          <ShopFormModal
            shop={currentShop}
            onClose={() => setShopModalOpen(false)}
            onSave={handleSaveShop}
          />
        )}

        {showInfoModal && currentShop && (
          <ShopInfoModal
            shop={currentShop}
            onClose={closeInfoModal}
            onEdit={openEditShopModal}
          />
        )}
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
};

export default AgentDashboard;
