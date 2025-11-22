// src/components/layout/Header.jsx
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import api from "../../api/api";
import {
  User,
  LogOut,
  Edit3,
  Menu,
  X,
  Bell,
  ChevronDown,
  UserCircle2,
  Mail,
  ShieldCheck,
  Search,
  Loader2 // Imported Loader icon
} from "lucide-react";

// Import the modals
import PendingShopsModal from "../modals/PendingShopsModal";
import ShopDetailsModal from "../modals/ShopDetailsModal";

export default function Header({ sidebarOpen, onToggleSidebar }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  
  // UI States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Loading State for Profile Save
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  // --- Notification State ---
  const [pendingCount, setPendingCount] = useState(0); 
  const [pendingShops, setPendingShops] = useState([]); 
  const [loadingPending, setLoadingPending] = useState(false);
  
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedPendingShop, setSelectedPendingShop] = useState(null);

  // 1. Poll for Statistics
  const fetchNotificationStats = async () => {
    try {
      const res = await api.get("/shops/stats/");
      setPendingCount(res.data.global_overview.pending_reviews);
    } catch (err) {
      console.error("Failed to fetch notification stats", err);
    }
  };

  useEffect(() => {
    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Actual List (Only when Bell is clicked)
  const handleOpenNotifications = async () => {
    setShowPendingModal(true);
    setLoadingPending(true);
    try {
      const res = await api.get("/shops/?verification_status=PENDING");
      const results = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setPendingShops(results);
      setPendingCount(results.length); // Sync count
    } catch (err) {
      toast.error("Failed to load pending shops");
      console.error(err);
    } finally {
      setLoadingPending(false);
    }
  };

  // Handler when a shop is verified inside the modal
  const handlePendingShopUpdate = (updatedShop) => {
      if (selectedPendingShop && selectedPendingShop.id === updatedShop.id) {
          setSelectedPendingShop(updatedShop);
      }
      if (updatedShop.verification_status !== 'PENDING') {
          setPendingShops(prev => prev.filter(s => s.id !== updatedShop.id));
          setPendingCount(prev => Math.max(0, prev - 1));
          setSelectedPendingShop(null);
      }
  };

  // --- Standard Handlers ---
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
    setIsSaving(true); // Start loading
    try {
      const res = await api.patch("/accounts/me/", formData);
      toast.success("Profile updated successfully!");
      setShowEditModal(false);
      updateUser(res.data);
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error(err);
    } finally {
      setIsSaving(false); // Stop loading
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        
        {/* Left: Sidebar Toggle & Title */}
        <div className="flex items-center gap-4">
            <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-100"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
            {/* On mobile: Menu icon. On Desktop: Menu icon (to collapse) */}
            <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-lg font-bold text-gray-900 hidden sm:block tracking-tight">
             Dashboard
            </h1>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3 md:gap-5">
            
            {/* --- Notification Bell --- */}
            <button 
                onClick={handleOpenNotifications}
                className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all focus:outline-none active:scale-95"
                title="Pending Shop Verifications"
            >
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5 pointer-events-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {/* Profile Section */}
            <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 group"
            >
                <div className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-sm ring-2 ring-gray-50 group-hover:ring-gray-200 transition-all">
                   <span className="text-xs font-bold">
                     {(user?.first_name?.[0] || user?.username?.[0] || "A").toUpperCase()}
                   </span>
                </div>
                
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none">
                        {user?.first_name || user?.username || "Admin"}
                    </p>
                    {/* Added 'capitalize' class here */}
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 capitalize">
                        {user?.role || "Administrator"}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden md:block ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <>
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowDropdown(false)}
                />
                <div
                    className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-xl z-40 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 md:hidden">
                        <p className="text-sm font-semibold text-gray-900">
                            {user?.first_name || user?.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                        </p>
                    </div>
                    
                    <div className="p-1">
                        <button
                            onClick={handleEditClick}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                            Edit Profile
                        </button>
                    </div>
                    
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    
                    <div className="p-1">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
                </>
            )}
            </div>
        </div>
      </header>

      {/* --- MODALS --- */}

      {/* 1. Pending Shops List Modal */}
      {showPendingModal && (
          <PendingShopsModal 
            pendingShops={pendingShops}
            isLoading={loadingPending}
            onClose={() => setShowPendingModal(false)}
            onSelectShop={(shop) => {
                setSelectedPendingShop(shop);
            }}
          />
      )}

      {/* 2. Detailed View for Verification */}
      {selectedPendingShop && (
          <ShopDetailsModal 
            shop={selectedPendingShop}
            onClose={() => setSelectedPendingShop(null)}
            onUpdate={handlePendingShopUpdate} 
          />
      )}

      {/* Logout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-100">
                <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Are you sure you want to log out? You will need to sign in again to access the dashboard.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-gray-500" />
                  Edit Profile
                </h2>
                <button 
                    onClick={() => !isSaving && setShowEditModal(false)}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">First Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={isSaving}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="First Name"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Last Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={isSaving}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Last Name"
                        />
                    </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSaving}
                        type="email"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="name@company.com"
                    />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                      <p className="text-xs font-semibold text-blue-800">Admin Privileges</p>
                      {/* Added 'capitalize' class here as well */}
                      <p className="text-xs text-blue-600 mt-0.5 leading-relaxed capitalize">
                          Your role as {user?.role || 'Admin'} allows you to manage shops and agents.
                      </p>
                  </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed min-w-[130px] flex items-center justify-center"
              >
                {isSaving ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}