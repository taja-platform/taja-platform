// src/components/ExpandedMap.jsx
import React from "react";
import ShopMap from "./ShopMap.jsx";
import { X, Search, Filter, MapPin, CheckCircle } from "lucide-react";

const VERIFICATION_STATUSES = [
  { value: "PENDING", label: "Pending Review" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All Statuses" },
];

const ExpandedMap = ({ 
  filters, 
  onFilterChange, 
  onClose, 
  availableStates, 
  availableLgas 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-20">
        
        {/* Title Area */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Map Explorer
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                Filter and view shop locations
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 flex-grow lg:justify-center">
           
           {/* Search */}
           <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                name="search"
                placeholder="Search map..."
                value={filters.search}
                onChange={onFilterChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm"
            />
           </div>

           {/* State Dropdown */}
           <div className="relative flex-grow sm:flex-grow-0 sm:w-40">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="state"
                value={filters.state}
                onChange={onFilterChange}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white shadow-sm"
              >
                <option value="all">All States</option>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>

           {/* LGA Dropdown */}
           <div className="relative flex-grow sm:flex-grow-0 sm:w-40">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="lga"
                value={filters.lga}
                onChange={onFilterChange}
                disabled={!availableLgas.length}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="all">All LGAs</option>
                {availableLgas.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
           </div>

            {/* Status Dropdown (Fixed mapping to verification_status) */}
           <div className="relative flex-grow sm:flex-grow-0 sm:w-44">
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="verification_status" 
                value={filters.verification_status}
                onChange={onFilterChange}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white shadow-sm"
              >
                {VERIFICATION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
           </div>
        </div>

        {/* Desktop Close Button */}
        <button 
            onClick={onClose}
            className="hidden lg:flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
            <X className="w-4 h-4 mr-2" />
            Close View
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-grow relative bg-gray-50">
        <ShopMap filters={filters} mapHeight="100%" />
      </div>    
    </div>
  );
};

export default ExpandedMap;