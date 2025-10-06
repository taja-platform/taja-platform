// src/pages/ShopsPage.jsx
import React, { useState, useEffect } from "react";
import ShopTable from "../components/ShopTable";
import ShopMap from "../components/ShopMap";
import api from "../api/api"; // Adjust the import path as necessary

// --- Tab Widget Component (optional, for clean code) ---
const TabButton = ({ isActive, onClick, children }) => {
  // ... (Component remains the same) ...
  const activeClasses =
    "text-indigo-600 border-b-2 border-indigo-600 font-semibold";
  const inactiveClasses =
    "text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm transition-colors duration-150 ${
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

  // ⭐ 1. Add Filter State
  const [filters, setFilters] = useState({
    state: "all", // Filter by Location/State
    agent: "all", // Filter by Agent (created_by)
    status: "all", // Filter by Status (is_active)
    dateRange: "all", // Filter by Date Created
  });

  // ⭐ 2. Add Filter Change Handler
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    // When a filter changes, we might want to automatically reset to page 1
    // We'll manage that state in ShopTable.jsx
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Use the expected API endpoint for agents
        const res = await api.get("/accounts/agents/");

        // Map the fetched agents into a list of options: { value: ID, label: Name/Email }
        const options = res.data.map((agent) => {
          const fullName = `${agent.user.first_name || ""} ${
            agent.user.last_name || ""
          }`.trim();
          return {
            // The value will be the agent's ID (the backend foreign key)
            value: String(agent.agent_id),
            // The label will be their name or email
            label: fullName || agent.email,
          };
        });

        setAgentOptions(options);
      } catch (err) {
        console.error("Failed to fetch agents for filter:", err);
        // Optionally add a toast notification
      }
    };

    fetchAgents();
  }, []); // Empty dependency array means this runs only once on mount

  // ⭐ 3. Define State Options (based on your seed data)
  const availableStates = [
    "Lagos",
    "Abuja",
    "Kano",
    "Rivers",
    "Oyo",
    "Kaduna",
    "Enugu",
    "Plateau",
    "Delta",
  ];
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
    <div>
      {/* ... Header remains the same ... */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Shops Management
        </h2>
      </div>

      {/* Filters Container */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 mb-0 flex flex-wrap gap-4 items-center">
        {/* Filter by State */}
        <select
          name="state"
          value={filters.state}
          onChange={handleFilterChange}
          className="border-gray-300 rounded-lg"
        >
          <option value="all">Filter by State</option>
          {availableStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* Filter by Agent (Placeholder - In a real app, you'd fetch agents) */}
        <select
          name="agent"
          value={filters.agent}
          onChange={handleFilterChange}
          className="border-gray-300 rounded-lg"
        >
          <option value="all">Filter by Agent</option>
          {agentOptions.map(
            (
              agent // ⭐ Use the new state
            ) => (
              <option key={agent.value} value={agent.value}>
                {agent.label}
              </option>
            )
          )}
        </select>

        {/* Filter by Status (is_active) */}
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border-gray-300 rounded-lg"
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
          className="border-gray-300 rounded-lg"
        >
          {dateRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Widget Container (remains the same) */}
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

      {/* Conditional Content */}
      <div className="bg-white p-6 rounded-b-2xl border border-t-0 border-gray-200">
        {activeTab === "manage" && (
          <div className="w-full">
            <h3 className="font-semibold mb-4">All Shops (Table View)</h3>
            {/* ⭐ Pass filters as props */}
            <ShopTable filters={filters} />
          </div>
        )}

        {/* ... Map View remains the same ... */}
        {activeTab === "map" && (
          <div className="w-full">
            <h3 className="font-semibold mb-4">Shops Location Map</h3>
            <ShopMap filters={filters} mapHeight="600px" />
          </div>
        )}
      </div>
    </div>
  );
}
