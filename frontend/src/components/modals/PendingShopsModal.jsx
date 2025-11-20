import React from "react";
import { X, Store, MapPin, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function PendingShopsModal({ pendingShops, onClose, onSelectShop }) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="relative mr-3">
                <Store className="w-6 h-6 text-orange-500" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
            </div>
            Pending Verifications
            <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                {pendingShops.length}
            </span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-2">
            {pendingShops.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Store className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500 text-sm mt-1">There are no pending shops to verify right now.</p>
                </div>
            ) : (
                <ul className="space-y-1">
                    {pendingShops.map((shop) => (
                        <li key={shop.id}>
                            <button
                                onClick={() => onSelectShop(shop)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group text-left border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-center space-x-4 overflow-hidden">
                                    {/* Thumbnail / Icon */}
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
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
                                                {shop.state}
                                            </span>
                                            <span className="flex items-center truncate">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {format(new Date(shop.date_created), "MMM d")}
                                            </span>
                                        </div>
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