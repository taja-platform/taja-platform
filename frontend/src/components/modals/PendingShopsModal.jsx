// src/components/modals/PendingShopsModal.jsx
import React, { useState, useEffect } from "react";
import { X, Store, MapPin, Clock, ChevronRight, AlertCircle, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import api from "../../api/api";
import { toast } from "sonner";

export default function PendingShopsModal({ onClose, onSelectShop }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // 'PENDING' or 'REJECTED'
  
  // Stats state for the tab badges
  const [stats, setStats] = useState({
    pending: 0,
    rejected: 0
  });

  // 1. Fetch Counts on Mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/shops/stats/");
        const data = res.data.global_overview;
        setStats({
          pending: data.pending_reviews || 0,
          rejected: data.rejected_reviews || 0
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  // 2. Fetch List Data
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setShops([]); 
      try {
        const statusParam = activeTab === "PENDING" ? "PENDING" : "REJECTED";
        const res = await api.get(`/shops/?verification_status=${statusParam}`);
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setShops(data);
      } catch (err) {
        console.error("Failed to load list", err);
        toast.error(`Could not load ${activeTab.toLowerCase()} shops.`);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [activeTab]);

  const TabButton = ({ id, label, count, icon: Icon }) => {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
            <Icon className={`w-4 h-4 ${isActive ? (id === 'PENDING' ? 'text-amber-600' : 'text-red-600') : 'text-gray-400'}`} />
            {label}
            {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg h-[600px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-white z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Verification Queue
                        {stats.pending > 0 && (
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Review newly added shops or rejected submissions.</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Sleek Segmented Control Tabs */}
            <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1">
                <TabButton 
                    id="PENDING" 
                    label="Pending Review" 
                    count={stats.pending} 
                    icon={Clock}
                />
                <TabButton 
                    id="REJECTED" 
                    label="Rejected" 
                    count={stats.rejected} 
                    icon={XCircle}
                />
            </div>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto flex-1 bg-gray-50/50 px-4 pb-4">
            {loading ? (
                // Skeleton Loader
                <div className="space-y-3 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : shops.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeTab === 'PENDING' ? 'bg-amber-50' : 'bg-gray-100'}`}>
                        {activeTab === 'PENDING' ? <CheckCircle2 className="w-8 h-8 text-amber-500" /> : <AlertCircle className="w-8 h-8 text-gray-400" />}
                    </div>
                    <h3 className="text-gray-900 font-semibold text-lg">
                        {activeTab === 'PENDING' ? "All Caught Up!" : "No Rejected Shops"}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        {activeTab === 'PENDING' 
                            ? "There are currently no pending verification requests in the queue." 
                            : "The rejected shops list is currently empty."}
                    </p>
                </div>
            ) : (
                // Shop List
                <ul className="space-y-2 pt-2">
                    {shops.map((shop) => (
                        <li key={shop.id}>
                            <button
                                onClick={() => onSelectShop(shop)}
                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl transition-all group text-left shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    {/* Thumbnail */}
                                    <div className="h-14 w-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 relative flex items-center justify-center">
                                        {shop.photos && shop.photos.length > 0 ? (
                                            <img src={shop.photos[0].photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>

                                    {/* Text Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                                            {shop.name}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-1.5 gap-3">
                                            <span className="flex items-center truncate bg-gray-100 px-2 py-0.5 rounded-md">
                                                <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                                                {shop.state || "N/A"}
                                            </span>
                                            <span className="flex items-center truncate">
                                                <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                                                {shop.date_created ? format(new Date(shop.date_created), "MMM d, h:mm a") : "N/A"}
                                            </span>
                                        </div>
                                        
                                        {/* Rejection Reason Tag */}
                                        {activeTab === "REJECTED" && shop.rejection_reason && (
                                            <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 w-fit max-w-full">
                                                <AlertCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                                <span className="truncate">{shop.rejection_reason}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="pl-4">
                                    <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-center">
             <button 
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
             >
                Close Queue
             </button>
        </div>
      </div>
    </div>
  );
}