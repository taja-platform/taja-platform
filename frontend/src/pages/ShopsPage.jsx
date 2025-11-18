// src/pages/ShopsPage.jsx
import React, { useState, useEffect } from "react";
import ShopTable from "../components/ShopTable";
import ShopMap from "../components/ShopMap";
import ExpandedMap from "../components/ExpandedMap"; // Import the new component
import api from "../api/api";
import { Search, X, Maximize2 } from "lucide-react"; // Added Maximize2

// --- State and LGA Mapping ---
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

const TabButton = ({ isActive, onClick, children }) => {
  const activeClasses = "text-indigo-600 border-b-2 border-indigo-600 font-semibold";
  const inactiveClasses = "text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs sm:text-sm transition-colors duration-150 ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      {children}
    </button>
  );
};

export default function ShopsPage() {
  const [activeTab, setActiveTab] = useState("manage");
  const [agentOptions, setAgentOptions] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);
  const [isMapExpanded, setIsMapExpanded] = useState(false); // State for map expansion

  const [filters, setFilters] = useState({
    search: "",
    state: "all",
    lga: "all",
    agent: "all",
    status: "all",
    dateRange: "all",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      state: "all",
      lga: "all",
      agent: "all",
      status: "all",
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
  const shopStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];
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
                      filters.status !== "all" || 
                      filters.dateRange !== "all";

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
          Shops Management
        </h2>
      </div>

      {/* Standard Filter Bar (Hidden when map is expanded overlay is active to avoid dupes, though overlay covers it anyway) */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 mb-0 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Search shops, address, or phones..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-900 focus:border-gray-900"
          />
        </div>

        <div className="flex flex-wrap gap-3 flex-grow sm:flex-grow-0">
          <select
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
            className="border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-gray-900 focus:border-gray-900 w-full sm:w-auto"
          >
            <option value="all">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            name="lga"
            value={filters.lga}
            onChange={handleFilterChange}
            disabled={!availableLgas.length}
            className="border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-100 w-full sm:w-auto"
          >
            <option value="all">All LGAs</option>
            {availableLgas.map((lga) => (
              <option key={lga} value={lga}>{lga}</option>
            ))}
          </select>

          <select
            name="agent"
            value={filters.agent}
            onChange={handleFilterChange}
            className="border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-gray-900 focus:border-gray-900 w-full sm:w-auto"
          >
            <option value="all">All Agents</option>
            {agentOptions.map((agent) => (
              <option key={agent.value} value={agent.value}>{agent.label}</option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-gray-900 focus:border-gray-900 w-full sm:w-auto"
          >
            {shopStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-gray-900 focus:border-gray-900 w-full sm:w-auto"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {isFiltering && (
          <button
            onClick={handleClearFilters}
            className="flex items-center justify-center space-x-1 text-sm text-red-600 hover:text-red-800 py-2 px-2 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="whitespace-nowrap">Clear</span>
          </button>
        )}
      </div>

      <div className="bg-white border-b border-gray-200 px-4 pt-2">
        <div className="flex -mb-px space-x-4">
          <TabButton
            isActive={activeTab === "manage"}
            onClick={() => setActiveTab("manage")}
          >
            📝 Manage Shops
          </TabButton>
          <TabButton
            isActive={activeTab === "map"}
            onClick={() => setActiveTab("map")}
          >
            🗺️ View Map
          </TabButton>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-b-2xl border border-t-0 border-gray-200 relative">
        {activeTab === "manage" && (
          <div className="w-full">
            <div className="overflow-x-auto">
              <ShopTable filters={filters} />
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="w-full relative">
             {/* Header for Map Tab with Expand Button */}
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Shops Location Map</h3>
                <button
                    onClick={() => setIsMapExpanded(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand Map</span>
                </button>
             </div>

            <div className="h-[400px] md:h-[600px] w-full border border-gray-200 rounded-xl overflow-hidden">
              <ShopMap filters={filters} mapHeight="100%" />
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Map Overlay */}
      {isMapExpanded && (
        <ExpandedMap 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setIsMapExpanded(false)}
            availableStates={availableStates}
            availableLgas={availableLgas}
            agentOptions={agentOptions}
            shopStatuses={shopStatuses}
            dateRanges={dateRanges}
        />
      )}
    </div>
  );
}