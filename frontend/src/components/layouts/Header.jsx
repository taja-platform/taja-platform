// src/components/layout/Header.jsx
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import api from "../../api/api";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon // Added Bell Icon
} from "@heroicons/react/24/outline";

// Import the modals
import PendingShopsModal from "../modals/PendingShopsModal";
import ShopDetailsModal from "../modals/ShopDetailsModal";

export default function Header({ sidebarOpen, onToggleSidebar }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  // --- Notification State ---
  const [pendingShops, setPendingShops] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedPendingShop, setSelectedPendingShop] = useState(null);

  // Fetch pending shops on mount (and periodically if you want polling)
  const fetchPendingShops = async () => {
    try {
        // Filter by is_active=false. Assuming your API supports ?status=false filtering 
        // or fetch all and filter. Based on your ShopTable logic, you fetch all shops at /shops/.
        // Ideally, update backend to support filtering: /shops/?is_active=false
        // For now, let's fetch all and filter client-side (or use your existing GET endpoint)
        const res = await api.get("/shops/"); 
        const allShops = Array.isArray(res.data) ? res.data : (res.data.results || []);
        
        const pending = allShops.filter(shop => shop.is_active === false);
        setPendingShops(pending);
    } catch (err) {
        console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchPendingShops();
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchPendingShops, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handler when a shop is verified inside the modal
  const handlePendingShopUpdate = (updatedShop) => {
      // 1. Update the selected shop state (if viewing)
      if (selectedPendingShop && selectedPendingShop.id === updatedShop.id) {
          setSelectedPendingShop(updatedShop);
      }

      // 2. If activated, remove from pending list
      if (updatedShop.is_active) {
          setPendingShops(prev => prev.filter(s => s.id !== updatedShop.id));
          // Close detailed modal since it's done? Or keep open? 
          // Let's close detail modal to return to list
          setSelectedPendingShop(null);
      }
  };


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
      updateUser(res.data);
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error(err);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="flex items-center">
            <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-100 md:hidden lg:block mr-2"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
            {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
            ) : (
                <Bars3Icon className="h-6 w-6" />
            )}
            </button>

            <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            Taja Admin Dashboard
            </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* --- Notification Bell --- */}
            <button 
                onClick={() => setShowPendingModal(true)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                title="Pending Shop Verifications"
            >
                <BellIcon className="w-6 h-6" />
                {pendingShops.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {pendingShops.length > 9 ? '9+' : pendingShops.length}
                    </span>
                )}
            </button>

            {/* Profile Section */}
            <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 group p-1 hover:bg-gray-50 rounded-lg transition-colors"
            >
                <UserCircleIcon className="w-8 h-8 text-gray-500 group-hover:text-gray-800 transition" />
                <div className="hidden md:block text-left mr-2">
                <p className="font-semibold text-sm text-gray-800 leading-tight">
                    {user?.first_name || user?.username || "User"}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
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
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition first:rounded-t-lg"
                >
                    <PencilSquareIcon className="w-5 h-5 mr-2 text-gray-600" />
                    Edit Profile
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition last:rounded-b-lg border-t border-gray-100"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2 text-gray-600" />
                    Logout
                </button>
                </div>
            )}
            </div>
        </div>
      </header>

      {/* --- MODALS --- */}

      {/* 1. Pending Shops List Modal */}
      {showPendingModal && (
          <PendingShopsModal 
            pendingShops={pendingShops}
            onClose={() => setShowPendingModal(false)}
            onSelectShop={(shop) => {
                setSelectedPendingShop(shop);
                // Note: We keep pending list open in background or close it? 
                // Let's keep it "open" logically, but the Details modal will overlay it.
                // Or we can close list modal when detail opens. 
                // For better UX on mobile, let's close list modal temporarily or just overlay.
                // React portals handle overlays well. Let's just set selectedPendingShop.
            }}
          />
      )}

      {/* 2. Detailed View for Verification */}
      {selectedPendingShop && (
          <ShopDetailsModal 
            shop={selectedPendingShop}
            onClose={() => setSelectedPendingShop(null)}
            onUpdate={handlePendingShopUpdate} // Pass the special handler that removes from list
          />
      )}


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

      {/* Edit Profile Modal */}
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