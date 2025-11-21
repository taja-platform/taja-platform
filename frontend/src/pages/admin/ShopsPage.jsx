// src/pages/ShopsPage.jsx
import React, { useState, useEffect } from "react";
import ShopTable from "../../components/ShopTable";
import ShopMap from "../../components/ShopMap";
import ExpandedMap from "../../components/ExpandedMap"; 
import api from "../../api/api";
import { 
  Search, X, Maximize2, CheckCircle, Clock, XCircle, 
  Map as MapIcon, LayoutList, MapPin, User, Calendar, Filter
} from "lucide-react";
import { useLocation } from "react-router-dom";

const STATE_LGAS = {
  "Lagos": [
    "Ikeja", "Surulere", "Eti-Osa", "Badagry", "Epe",
    "Kosofe", "Alimosho", "Oshodi-Isolo", "Agege", "Amuwo-Odofin"
  ],
  "Abuja": [
    "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"
  ],
  "Kano": [
    "Dala", "Fagge", "Gwale", "Kumbotso", "Nassarawa",
    "Tarauni", "Tofa", "Kano Municipal"
  ],
  "Oyo": [
    "Ibadan North", "Ibadan South-West", "Ibadan North-East", "Ogbomosho North",
    "Oyo East", "Oyo West", "Saki East", "Saki West", "Atiba", "Afijio"
  ],
};

// --- NEW: Verification Tabs Component ---
const VerificationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "PENDING", label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", activeBg: "bg-amber-100", border: "border-amber-200" },
    { id: "VERIFIED", label: "Verified Shops", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", activeBg: "bg-emerald-100", border: "border-emerald-200" },
    { id: "REJECTED", label: "Rejected", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", activeBg: "bg-rose-100", border: "border-rose-200" },
    { id: "ALL", label: "All Shops", icon: LayoutList, color: "text-gray-600", bg: "bg-white", activeBg: "bg-gray-100", border: "border-gray-200" },
  ];

  return (
    <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm whitespace-nowrap
              ${isActive 
                ? `ring-2 ring-offset-1 ring-gray-900 border-transparent ${tab.activeBg} text-gray-900` 
                : `hover:bg-gray-50 text-gray-600 ${tab.bg} ${tab.border}`
              }`}
          >
            {Icon && <Icon className={`w-4 h-4 mr-2.5 ${isActive ? "text-gray-900" : tab.color}`} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default function ShopsPage() {
  const [activeView, setActiveView] = useState("manage"); // 'manage' or 'map'
  const [agentOptions, setAgentOptions] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const location = useLocation();
  
  // Helper to get initial verification status from URL
  const getInitialVerificationStatus = () => {
      const params = new URLSearchParams(location.search);
      if (params.get("status") === "false") return "PENDING";
      const status = params.get("verification_status");
      if (status) return status.toUpperCase();
      return "PENDING"; 
  };

  const [filters, setFilters] = useState({
    search: "",
    state: "all",
    lga: "all",
    agent: "all",
    verification_status: getInitialVerificationStatus(),
    dateRange: "all",
  });

  useEffect(() => {
      const status = getInitialVerificationStatus();
      if (status !== filters.verification_status) {
          setFilters(prev => ({ ...prev, verification_status: status }));
      }
  }, [location.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  
  const handleVerificationTabChange = (status) => {
      setFilters(prev => ({ ...prev, verification_status: status }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      state: "all",
      lga: "all",
      agent: "all",
      verification_status: "PENDING",
      dateRange: "all",
    });
  };

  useEffect(() => {
    if (filters.state && filters.state !== "all") {
      setAvailableLgas(STATE_LGAS[filters.state] || []);
    } else {
      setAvailableLgas([]);
    }
    if (filters.state === "all") {
         setFilters(prev => ({ ...prev, lga: "all" }));
    }
  }, [filters.state]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get("/accounts/agents/");
        const options = res.data.map((agent) => {
          const fullName = `${agent.user.first_name || ""} ${agent.user.last_name || ""}`.trim();
          return {
            value: String(agent.agent_id), 
            label: fullName || agent.user.email,
          };
        });
        setAgentOptions(options);
      } catch (err) {
        console.error("Failed to fetch agents for filter:", err);
      }
    };
    fetchAgents();
  }, []);

  const availableStates = Object.keys(STATE_LGAS);
  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "last_7d", label: "Last 7 Days" },
    { value: "last_30d", label: "Last 30 Days" },
    { value: "last_90d", label: "Last 90 Days" },
  ];

  const isFiltering = filters.search || 
                      filters.state !== "all" || 
                      filters.lga !== "all" || 
                      filters.agent !== "all" || 
                      filters.dateRange !== "all";

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shops Management</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor, verify, and manage shop locations.</p>
        </div>

        {/* Sleek Segmented View Toggle */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center">
          <button
            onClick={() => setActiveView("manage")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === "manage"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setActiveView("map")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === "map"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* 1. Verification Status Tabs */}
      <VerificationTabs 
        activeTab={filters.verification_status} 
        onTabChange={handleVerificationTabChange} 
      />

      {/* 2. Main Content Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col xl:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-grow xl:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search shops by name or address..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-grow">
              {/* State Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-gray-900 focus:border-gray-900 appearance-none bg-white"
                >
                  <option value="all">All States</option>
                  {availableStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* LGA Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="lga"
                  value={filters.lga}
                  onChange={handleFilterChange}
                  disabled={!availableLgas.length}
                  className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-gray-900 focus:border-gray-900 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="all">All LGAs</option>
                  {availableLgas.map((lga) => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
              </div>

              {/* Agent Filter */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="agent"
                  value={filters.agent}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-gray-900 focus:border-gray-900 appearance-none bg-white"
                >
                  <option value="all">All Agents</option>
                  {agentOptions.map((agent) => (
                    <option key={agent.value} value={agent.value}>{agent.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-gray-900 focus:border-gray-900 appearance-none bg-white"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filter Button */}
            {isFiltering && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white min-h-[400px]">
          {activeView === "manage" && (
            <div className="w-full">
              <div className="overflow-x-auto">
                <ShopTable filters={filters} />
              </div>
            </div>
          )}

          {activeView === "map" && (
            <div className="w-full relative p-4">
               <div className="absolute top-8 right-8 z-10">
                 <button
                     onClick={() => setIsMapExpanded(true)}
                     className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white text-gray-900 shadow-lg rounded-xl text-sm font-medium transition-all hover:scale-105"
                 >
                     <Maximize2 className="w-4 h-4" />
                     <span>Expand Map</span>
                 </button>
               </div>

              <div className="h-[600px] w-full border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
                <ShopMap filters={filters} mapHeight="100%" />
              </div>
            </div>
          )}
        </div>
      </div>

      {isMapExpanded && (
        <ExpandedMap 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setIsMapExpanded(false)}
            availableStates={availableStates}
            availableLgas={availableLgas}
            agentOptions={agentOptions}
            shopStatuses={[]}
            dateRanges={dateRanges}
        />
      )}
    </div>
  );
}