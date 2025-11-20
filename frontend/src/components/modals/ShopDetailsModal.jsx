// src/components/modals/ShopDetailsModal.jsx
import React, { useState } from "react";
import { 
  X, MapPin, Phone, Calendar, User, 
  CheckCircle, XCircle, Globe, Store, Maximize2, ShieldCheck, Ban 
} from "lucide-react";
import { format } from "date-fns";
import api from "../../api/api"; 
import { toast } from "sonner";
import ExpandedImageViewer from "./ExpandedImageViewer"; 
import ShopHistory from "../ShopHistory"; 

// 1. Accept 'onUpdate' prop
export default function ShopDetailsModal({ shop: initialShopData, onClose, onUpdate }) {
  const [shop, setShop] = useState(initialShopData);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!shop) return null;

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
        const res = await api.patch(`/shops/${shop.id}/`, { is_active: newStatus });
        
        const updatedShop = res.data;
        
        // Update local state (Modal UI)
        setShop({ ...shop, is_active: updatedShop.is_active });

        // 2. Update Parent State (Table UI) immediately
        if (onUpdate) {
            onUpdate(updatedShop);
        }
        
        const action = newStatus ? "activated" : "deactivated";
        toast.success(`Shop successfully ${action}.`);
    } catch (err) {
        console.error("Failed to update status", err);
        toast.error("Failed to update shop status.");
    } finally {
        setIsUpdating(false);
    }
  };

  // ... (The rest of the file remains exactly the same) ...

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const InfoItem = ({ icon: Icon, label, value, isStatus }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="p-2 bg-white rounded-md shadow-sm text-gray-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {isStatus ? (
          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}>
            {value ? "Active / Verified" : "Inactive / Pending Review"}
          </span>
        ) : (
          <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">{value || "N/A"}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div 
          className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Store className="w-6 h-6 mr-2 text-indigo-600" />
                {shop.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">ID: #{shop.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-8">
            
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop Photos</h3>
              {shop.photos && shop.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {shop.photos.map((photoObj, index) => (
                    <div 
                      key={photoObj.id} 
                      className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-indigo-500 transition-all"
                      onClick={() => openImageViewer(index)}
                    >
                      <img 
                        src={photoObj.photo} 
                        alt={`Shop ${shop.name} ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Store className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No photos uploaded for this shop.</p>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Location & Contact</h3>
                <InfoItem icon={Phone} label="Phone Number" value={shop.phone_number} />
                <InfoItem icon={MapPin} label="Address" value={shop.address} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Globe} label="State" value={shop.state} />
                  <InfoItem icon={MapPin} label="LGA" value={shop.local_government_area} />
                </div>
                <InfoItem icon={MapPin} label="Coordinates" value={`${shop.latitude}, ${shop.longitude}`} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">System Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem 
                    icon={shop.is_active ? CheckCircle : XCircle} 
                    label="Status" 
                    value={shop.is_active} 
                    isStatus 
                  />
                  <InfoItem icon={User} label="Owner" value={shop.owner || "Unassigned"} />
                </div>
                <InfoItem icon={User} label="Captured By (Agent)" value={shop.created_by} />
                <InfoItem icon={Calendar} label="Date Created" value={shop.date_created ? format(new Date(shop.date_created), "PPP p") : "N/A"} />
                <InfoItem icon={Calendar} label="Last Updated" value={shop.date_updated ? format(new Date(shop.date_updated), "PPP p") : "N/A"} />
              </div>
            </section>

            {shop.description && (
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes / Description</h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed">
                  {shop.description}
                </div>
              </section>
            )}
            
            <section className="border-t border-gray-100 pt-6">
                <ShopHistory shopId={shop.id} />
            </section>

          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
             >
               Close
             </button>

             <div className="flex space-x-3">
                {!shop.is_active ? (
                    <button 
                        onClick={() => handleStatusChange(true)}
                        disabled={isUpdating}
                        className="flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                    >
                        {isUpdating ? "Processing..." : (
                            <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Verify & Activate
                            </>
                        )}
                    </button>
                ) : (
                    <button 
                        onClick={() => handleStatusChange(false)}
                        disabled={isUpdating}
                        className="flex items-center px-6 py-2 bg-red-50 border border-red-200 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        {isUpdating ? "Processing..." : (
                            <>
                                <Ban className="w-4 h-4 mr-2" />
                                Deactivate Shop
                            </>
                        )}
                    </button>
                )}
             </div>
          </div>
        </div>
      </div>

      {isImageViewerOpen && (
        <ExpandedImageViewer 
          photos={shop.photos} 
          initialIndex={selectedImageIndex} 
          onClose={() => setIsImageViewerOpen(false)} 
        />
      )}
    </>
  );
}