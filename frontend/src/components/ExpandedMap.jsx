import React from "react";
import ShopMap from "./ShopMap.jsx"; // Added .jsx extension to fix resolution error
import { X, Search, Filter } from "lucide-react";

// Reusing the same filter logic/UI but styled for the overlay header
const ExpandedMap = ({ 
    filters, 
    onFilterChange, 
    onClose, 
    availableStates, 
    availableLgas, 
    agentOptions, 
    shopStatuses, 
    dateRanges 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-indigo-600" />
            Map Filters
          </h2>
           {/* Mobile Close Button (Visible only on small screens) */}
           <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Controls - Compact Row */}
        <div className="flex flex-wrap gap-2 flex-grow md:justify-center">
           {/* Search Input */}
           <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                name="search"
                placeholder="Search..."
                value={filters.search}
                onChange={onFilterChange}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            </div>

            {/* Dropdowns (Compact) */}
            <select
                name="state"
                value={filters.state}
                onChange={onFilterChange}
                className="border-gray-300 rounded-md py-1.5 px-2 text-sm w-32 focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="all">State</option>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
                name="lga"
                value={filters.lga}
                onChange={onFilterChange}
                disabled={!availableLgas.length}
                className="border-gray-300 rounded-md py-1.5 px-2 text-sm w-32 disabled:bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="all">LGA</option>
                {availableLgas.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

             <select
                name="status"
                value={filters.status}
                onChange={onFilterChange}
                className="border-gray-300 rounded-md py-1.5 px-2 text-sm w-28 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {shopStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
        </div>

        {/* Desktop Close Button */}
        <button 
            onClick={onClose}
            className="hidden md:flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
            <X className="w-4 h-4 mr-2" />
            Close Map
        </button>
      </div>

      {/* Map Container (Takes remaining height) */}
      <div className="flex-grow relative">
        <ShopMap filters={filters} mapHeight="100%" />
      </div>    
    </div>
  );
};

export default ExpandedMap;