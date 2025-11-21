// src/components/modals/PendingShopsModal.jsx
import React, { useState, useEffect } from "react";
import { X, Store, MapPin, Clock, ChevronRight, AlertCircle, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import api from "../../api/api";
import { toast } from "sonner";

export default function PendingShopsModal({ onClose, onSelectShop }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // 'PENDING' or 'REJECTED'

  // Fetch shops on mount to ensure fresh data
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const res = await api.get("/shops/");
        const data = res.data?.results || res.data || [];
        setShops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load shops", err);
        toast.error("Could not load pending verifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // Filter logic
  const filteredShops = shops.filter(shop => {
      if (activeTab === "PENDING") {
          // Show Pending (and ensure they aren't accidentally verified/rejected if API lags)
          return shop.verification_status === "PENDING" || (!shop.verification_status && !shop.is_active);
      }
      if (activeTab === "REJECTED") {
          return shop.verification_status === "REJECTED";
      }
      return false;
  });

  const TabButton = ({ id, label, count, colorClass }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
        activeTab === id
          ? `border-${colorClass}-500 text-${colorClass}-600`
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs ${
          activeTab === id ? `bg-${colorClass}-100 text-${colorClass}-700` : "bg-gray-100 text-gray-600"
      }`}>
        {count}
      </span>
    </button>
  );

  // Counts for badges
  const pendingCount = shops.filter(s => s.verification_status === "PENDING").length;
  const rejectedCount = shops.filter(s => s.verification_status === "REJECTED").length;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="relative mr-3">
                    <Store className="w-6 h-6 text-indigo-600" />
                    </div>
                    Verification Queue
                </h2>
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex">
                <TabButton id="PENDING" label="Pending Review" count={pendingCount} colorClass="orange" />
                <TabButton id="REJECTED" label="Rejected" count={rejectedCount} colorClass="red" />
            </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-2 flex-1 min-h-[300px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                    <RefreshCcw className="w-8 h-8 text-gray-300 animate-spin mb-2" />
                    <p className="text-gray-400 text-sm">Loading shops...</p>
                </div>
            ) : filteredShops.length === 0 ? (
                <div className="text-center py-12 px-4 h-full flex flex-col items-center justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${activeTab === 'PENDING' ? 'bg-green-50' : 'bg-gray-50'}`}>
                        {activeTab === 'PENDING' ? <Store className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-gray-400" />}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {activeTab === 'PENDING' ? "All Caught Up!" : "No Rejected Shops"}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {activeTab === 'PENDING' 
                            ? "There are no pending shops to verify right now." 
                            : "You haven't rejected any shops recently."}
                    </p>
                </div>
            ) : (
                <ul className="space-y-1">
                    {filteredShops.map((shop) => (
                        <li key={shop.id}>
                            <button
                                onClick={() => onSelectShop(shop)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group text-left border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-center space-x-4 overflow-hidden">
                                    {/* Thumbnail */}
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative">
                                        {shop.photos && shop.photos.length > 0 ? (
                                            <img src={shop.photos[0].photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Store className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {shop.name}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-3">
                                            <span className="flex items-center truncate">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {shop.state || "N/A"}
                                            </span>
                                            <span className="flex items-center truncate">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {format(new Date(shop.date_created), "MMM d")}
                                            </span>
                                        </div>
                                        {/* Show rejection reason preview if rejected */}
                                        {activeTab === "REJECTED" && shop.rejection_reason && (
                                            <p className="text-xs text-red-500 mt-1 truncate w-full">
                                                Reason: {shop.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors ml-2 flex-shrink-0" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
             <button 
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
             >
                Close List
             </button>
        </div>
      </div>
    </div>
  );
}