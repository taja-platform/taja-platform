import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";

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
const User = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
const MapPin = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const LogOut = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-5a3 3 0 013-3h5"
    />
  </svg>
);
const MenuIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const XIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const CheckCircle = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const Plus = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

// --- Mock Data and Utilities (UNCHANGED) ---

const initialAgentProfile = {
  agent_id: "AGT0042",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone_number: "555-0199",
  address: "123 Main St, Anytown, State 90210",
  state: "California",
};

const initialShops = [
  {
    id: 1,
    name: "QuickStop Groceries",
    address: "45 Elm Rd",
    latitude: 34.0522,
    longitude: -118.2437,
    state: "CA",
    date_created: "2024-05-10",
  },
  {
    id: 2,
    name: "The Corner Pharmacy",
    address: "800 Pine Ave",
    latitude: 34.045,
    longitude: -118.25,
    state: "CA",
    date_created: "2024-06-15",
  },
  {
    id: 3,
    name: "Tech Repair Hub",
    address: "99 Broadway",
    latitude: 34.06,
    longitude: -118.2,
    state: "CA",
    date_created: "2024-07-01",
  },
];

const mockToast = {
  success: (msg) => console.log(`[TOAST SUCCESS] ${msg}`),
  error: (msg) => console.error(`[TOAST ERROR] ${msg}`),
  info: (msg) => console.log(`[TOAST INFO] ${msg}`),
};

// --- Nav Item Component (UNCHANGED) ---
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
    <Icon className="w-5 h-5" />
    <span className="font-medium">{title}</span>
  </a>
);

// --- Shop Management Components (UNCHANGED) ---

const ShopCard = ({ shop, onEdit }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl hover:border-gray-200">
    <h3 className="text-xl font-semibold text-gray-900 mb-1">{shop.name}</h3>
    <p className="text-sm text-gray-500 mb-3 flex items-center">
      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
      {shop.address}
    </p>
    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
      <div>
        <span className="font-medium text-gray-500">Latitude:</span>{" "}
        {shop.latitude}
      </div>
      <div>
        <span className="font-medium text-gray-500">Longitude:</span>{" "}
        {shop.longitude}
      </div>
      <div className="col-span-2">
        <span className="font-medium text-gray-500">Created:</span>{" "}
        {shop.date_created}
      </div>
    </div>
    <button
      onClick={() => onEdit(shop)}
      className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
    >
      Edit Details
    </button>
  </div>
);

const ShopFormModal = ({ shop, onClose, onSave }) => {
  const isEditing = !!shop.id;
  const [formData, setFormData] = useState(
    shop || {
      name: "",
      phone_number: "",
      address: "",
      state: "",
      latitude: null,
      longitude: null,
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationPin = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    mockToast.info(`Location Pinned: Lat ${lat}, Lng ${lng}`);
  };

  const useCurrentLocation = () => {
    setIsLoading(true);
    mockToast.info("Requesting current location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationPin(
            position.coords.latitude.toFixed(6),
            position.coords.longitude.toFixed(6)
          );
          setIsLoading(false);
        },
        (error) => {
          mockToast.error(
            "Could not get location. Ensure permissions are granted."
          );
          console.error("Geolocation error:", error);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      mockToast.error("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      mockToast.error("Please pin the shop's location.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSave(formData);
      mockToast.success(
        `Shop ${isEditing ? "updated" : "added"} successfully!`
      );
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Shop" : "Add New Shop"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <Input
            id="name"
            name="name"
            label="Shop Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
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
          <Input
            id="address"
            name="address"
            label="Full Address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <Input
            id="state"
            name="state"
            label="State/Region"
            type="text"
            value={formData.state}
            onChange={handleChange}
            required
          />

          {/* Location Pinning Section */}
          <div className="pt-3 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-900" /> Location
              Coordinates
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                id="latitude"
                name="latitude"
                label="Latitude"
                type="number"
                step="0.000001"
                value={formData.latitude || ""}
                onChange={handleChange}
                readOnly={isLoading}
                required
              />
              <Input
                id="longitude"
                name="longitude"
                label="Longitude"
                type="number"
                step="0.000001"
                value={formData.longitude || ""}
                onChange={handleChange}
                readOnly={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isLoading}
                className="w-full py-3 flex items-center justify-center bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isLoading ? "Locating..." : "Use Current Location"}
              </button>

              <div className="text-center text-sm text-gray-500 py-2">
                - OR -
              </div>

              {/* Simulated Map */}
              <div
                className="h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer text-gray-500 hover:bg-gray-200 transition-colors"
                onClick={() =>
                  handleLocationPin(
                    34.053 + (Math.random() * 0.01).toFixed(4),
                    -118.243 - (Math.random() * 0.01).toFixed(4)
                  )
                }
              >
                <p className="text-center">
                  Click here to simulate selecting a new location from a map.
                  <br />
                  (Lat/Lng will be auto-filled)
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <span>{isEditing ? "Update Shop" : "Add Shop"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Profile Editor Component (UNCHANGED) ---

const ProfileEditor = ({ profile, onSave }) => {
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

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onSave(formData);
      mockToast.success("Profile updated successfully!");
      setIsLoading(false);
    }, 800);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      mockToast.error("New password and confirmation do not match.");
      return;
    }
    setIsPasswordLoading(true);
    setTimeout(() => {
      // Simulated password update
      mockToast.success("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setIsPasswordLoading(false);
    }, 1000);
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
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
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

// --- Dashboard Component (UNCHANGED) ---

const DashboardView = ({ totalShops, shopsToday }) => {
  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon className="w-6 h-6" />
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
        <Icon className="w-5 h-5" />
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

// --- Form Element Components (UNCHANGED) ---

const Input = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
  required = false,
  step,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-200 ${
          focused || value ? "transform -translate-y-2" : ""
        }`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focused || value
              ? "top-2 text-xs text-gray-700 font-medium"
              : "top-4 text-gray-500"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          step={step}
          className={`w-full h-14 px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 placeholder-transparent ${
            readOnly
              ? "bg-gray-100 cursor-not-allowed"
              : focused
              ? "border-gray-900 bg-white shadow-sm"
              : "border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
          readOnly={readOnly}
          required={required}
        />
      </div>
    </div>
  );
};

const Textarea = ({ id, name, label, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-200 ${
          focused || value ? "transform -translate-y-2" : ""
        }`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focused || value
              ? "top-2 text-xs text-gray-700 font-medium"
              : "top-4 text-gray-500"
          }`}
        >
          {label}
        </label>
        <textarea
          id={id}
          name={name}
          rows="3"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 placeholder-transparent ${
            focused
              ? "border-gray-900 bg-white shadow-sm"
              : "border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
        />
      </div>
    </div>
  );
};

// --- Main AgentDashboard Component (UPDATED) ---

const AgentDashboard = () => {
  const [view, setView] = useState("dashboard"); // 'dashboard', 'profile', 'shops'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(initialAgentProfile);
  const [shops, setShops] = useState(initialShops);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);

  const { user, logout, updateUser, fetchUserProfile } =
    useContext(AuthContext);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowConfirmModal(false);
  };

  // Filter shops added today for the dashboard count
  const shopsTodayCount = shops.filter(
    (shop) => shop.date_created === new Date().toISOString().split("T")[0]
  ).length;



  const handleProfileSave = (newProfileData) => {
    setProfile(newProfileData);
  };

  const handleSaveShop = (shopData) => {
    if (shopData.id) {
      // Update existing shop
      setShops((prev) =>
        prev.map((s) => (s.id === shopData.id ? shopData : s))
      );
    } else {
      // Add new shop
      // Safely find the next ID
      const maxId = shops.reduce(
        (max, shop) => (shop.id > max ? shop.id : max),
        0
      );
      const newId = maxId + 1;
      const newShop = {
        ...shopData,
        id: newId,
        date_created: new Date().toISOString().split("T")[0], // Set today's date
      };
      setShops((prev) => [...prev, newShop]);
    }
    setShopModalOpen(false);
    setCurrentShop(null);
  };

  const openAddShopModal = () => {
    setCurrentShop(null);
    setShopModalOpen(true);
  };

  const openEditShopModal = (shop) => {
    setCurrentShop(shop);
    setShopModalOpen(true);
  };

  const renderView = () => {
    switch (view) {
      case "profile":
        return <ProfileEditor profile={profile} onSave={handleProfileSave} />;
      case "shops":
        return (
          <ShopsManager
            shops={shops}
            onAdd={openAddShopModal}
            onEdit={openEditShopModal}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardView
            totalShops={shops.length}
            shopsToday={shopsTodayCount}
          />
        );
    }
  };

  const ShopsManager = ({ shops, onAdd, onEdit }) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} onEdit={onEdit} />
        ))}
      </div>
      {shops.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            No shops added yet. Start by adding your first shop!
          </p>
        </div>
      )}
    </div>
  );

  // Define navigation items
  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
    { title: "Shop Management", icon: Store, view: "shops" },
    { title: "My Profile", icon: User, view: "profile" },
  ];

  // Function to handle the backdrop click on mobile
  const handleBackdropClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans flex">
        {/* Mobile Header/Nav Button (Visible below md screen size) */}
        <header className="fixed top-0 left-0 right-0 md:hidden z-40 bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Agent Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-700 rounded-lg hover:bg-gray-200"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </header>

        {/* Backdrop for Mobile Sidebar (NEW) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
            onClick={handleBackdropClick}
          ></div>
        )}

        {/* Sidebar (Desktop) / Mobile Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out 
                    md:translate-x-0 md:static md:flex-shrink-0 md:h-auto
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Logo/Title */}
            <div className="text-white text-2xl font-extrabold mb-8 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-green-400" />
              <span>Agent Portal</span>
            </div>

            {/* Navigation */}
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
                    setIsSidebarOpen(false); // Close sidebar after selection on mobile
                  }}
                />
              ))}
            </nav>

            {/* Profile/Logout */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 p-3 text-white">
                <User className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm font-semibold">{user?.first_name || user?.username || "User"} {user?.last_name || user?.username || "User"}</p>
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

        {/* Main Content Area */}
        <main
          className={`flex-grow p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto py-4">{renderView()}</div>
        </main>

        {/* Shop Modal */}
        {shopModalOpen && (
          <ShopFormModal
            shop={currentShop}
            onClose={() => setShopModalOpen(false)}
            onSave={handleSaveShop}
          />
        )}
      </div>
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
    </>
  );
};

export default AgentDashboard;
