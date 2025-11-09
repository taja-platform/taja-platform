// src/pages/ShopsPage.jsx
import React, { useState, useEffect } from "react";
import ShopTable from "../components/ShopTable";
import ShopMap from "../components/ShopMap";
import api from "../api/api"; // Adjust the import path as necessary

// --- NEW: State and LGA Mapping ---
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


// --- Tab Widget Component (optional, for clean code) ---
const TabButton = ({ isActive, onClick, children }) => {
  const activeClasses =
    "text-indigo-600 border-b-2 border-indigo-600 font-semibold";
  const inactiveClasses =
    "text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <button
      onClick={onClick}
      // Reduced padding and text size on mobile for better fit
      className={`px-3 py-2 text-xs sm:text-sm transition-colors duration-150 ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      {children}
    </button>
  );
};

// --- Main Page Component ---
export default function ShopsPage() {
  const [activeTab, setActiveTab] = useState("manage");
  const [agentOptions, setAgentOptions] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);

  const [filters, setFilters] = useState({
    state: "all",
    lga: "all", 
    agent: "all",
    status: "all",
    dateRange: "all",
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Effect to update LGAs when state filter changes
  useEffect(() => {
    if (filters.state && filters.state !== 'all') {
      setAvailableLgas(STATE_LGAS[filters.state] || []);
    } else {
      setAvailableLgas([]); 
    }
    // Reset LGA filter when state changes
    setFilters(prevFilters => ({ ...prevFilters, lga: 'all' }));
  }, [filters.state]);


  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get("/accounts/agents/");
        const options = res.data.map((agent) => {
          const fullName = `${agent.user.first_name || ""} ${
            agent.user.last_name || ""
          }`.trim();
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

  return (
    // General padding adjusted for mobile
    <div className="p-4 md:p-6"> 
      <div className="flex justify-between items-center mb-6">
        {/* Adjusted text size for smaller screens */}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
          Shops Management
        </h2>
      </div>

      {/* *** RESPONSIVE FILTER BAR: Uses flex-wrap and full width inputs on mobile ***
      */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 mb-0 flex flex-wrap gap-3 sm:gap-4 items-center">
        
        {/* Filter by State */}
        <select
          name="state"
          value={filters.state}
          onChange={handleFilterChange}
          // Make input full width on mobile, then auto on small screens and up
          className="border-gray-300 rounded-lg w-full sm:w-auto text-sm" 
        >
          <option value="all">Filter by State</option>
          {availableStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* --- Filter by LGA --- */}
        <select
          name="lga"
          value={filters.lga}
          onChange={handleFilterChange}
          disabled={!availableLgas.length} 
          // Make input full width on mobile, then auto on small screens and up
          className="border-gray-300 rounded-lg disabled:bg-gray-100 w-full sm:w-auto text-sm"
        >
          <option value="all">Filter by LGA</option>
          {availableLgas.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>

        {/* Filter by Agent */}
        <select
          name="agent"
          value={filters.agent}
          onChange={handleFilterChange}
          // Make input full width on mobile, then auto on small screens and up
          className="border-gray-300 rounded-lg w-full sm:w-auto text-sm"
        >
          <option value="all">Filter by Agent</option>
          {agentOptions.map((agent) => (
            <option key={agent.value} value={agent.value}>
              {agent.label}
            </option>
          ))}
        </select>

        {/* Filter by Status */}
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          // Make input full width on mobile, then auto on small screens and up
          className="border-gray-300 rounded-lg w-full sm:w-auto text-sm"
        >
          {shopStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {/* Filter by Date Created */}
        <select
          name="dateRange"
          value={filters.dateRange}
          onChange={handleFilterChange}
          // Make input full width on mobile, then auto on small screens and up
          className="border-gray-300 rounded-lg w-full sm:w-auto text-sm"
        >
          {dateRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs area: Reduced padding */}
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

      {/* Content area: Adjusted padding */}
      <div className="bg-white p-4 md:p-6 rounded-b-2xl border border-t-0 border-gray-200">
        {activeTab === "manage" && (
          <div className="w-full">
            <h3 className="font-semibold mb-4 text-lg">All Shops (Table View)</h3>
            {/* The ShopTable component itself needs to handle horizontal scrolling on mobile */}
            <div className="overflow-x-auto"> 
                <ShopTable filters={filters} />
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="w-full">
            <h3 className="font-semibold mb-4 text-lg">Shops Location Map</h3>
            {/* Added a responsive height class for the map container */}
            <div className="h-[400px] md:h-[600px] w-full"> 
                <ShopMap filters={filters} mapHeight="100%" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}   