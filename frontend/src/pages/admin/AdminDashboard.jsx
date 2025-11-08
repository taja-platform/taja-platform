// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import StatCard from "../../components/specifics/StatCard";
import api from "../../api/api";

export default function AdminDashboard() {
  const [agentCount, setAgentCount] = useState(0);
  const [shopCount, setShopCount] = useState(0); // If you want to make this dynamic later
  const navigate = useNavigate();

  // Fetch agents count
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get("/accounts/agents/");
        setAgentCount(res.data.length); // assuming your endpoint returns a list of agents
      } catch (err) {
        console.error("Failed to fetch agents count:", err);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get("/shops/");
        setShopCount(res.data.length); // assuming your endpoint returns a list of shops
      } catch (err) {
        console.error("Failed to fetch shops count:", err);
      }
    };

    fetchShops();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        🚀 Dashboard Overview
      </h2>

      {/* 1. HERO SECTION: Animated Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Shops (using a more advanced StatCard that supports radial progress) */}
        <div
          onClick={() => navigate("/agents")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          {/* Total Agents */}
          <StatCard
            title="Total Shops"
            value={shopCount.toLocaleString()}
            icon={BuildingStorefrontIcon}
            // Custom prop for animation logic (e.g., growth percentage)
            growthRate={12}
          />
        </div>

        <div
          onClick={() => navigate("/agents")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          {/* Total Agents */}
          <StatCard
            title="Total Agents"
            value={agentCount.toLocaleString()}
            icon={UsersIcon}
            growthRate={-3} // Example: a negative growth rate
          />
        </div>

        {/* NEW: Onboarding Success Rate */}
        {/* <ShopGrowthRadialChart />  */}

        {/* NEW: New Shops (Wavy Line Chart Preview) */}
        {/* <NewShopsLineChartPreview />  */}
      </div>

      {/* 2. CORE VISUALIZATIONS SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization (Occupies 2/3 of the row) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold mb-4 text-gray-800">
            Shop Density by State 🌍
          </h3>
          {/* Component for the Interactive Choropleth Map */}
          {/* <ShopDensityMap />  */}
        </div>

        {/* Top 10 Bar Chart (Occupies 1/3 of the row) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold mb-4 text-gray-800">
            Top Performing States
          </h3>
          {/* Component for the Animated Bar Chart (e.g., Liquid Fill bars) */}
          {/* <TopStatesBarChart /> */}
        </div>
      </div>

      {/* 3. PERFORMANCE SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance Scatter Plot */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-96">
          <h3 className="font-semibold mb-4 text-gray-800">
            Agent Performance Snapshot 🎯
          </h3>
          {/* Component for the Bubble/Scatter Chart */}
          {/* <AgentPerformanceBubbleChart /> */}
        </div>

        {/* Shop Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-96">
          <h3 className="font-semibold mb-4 text-gray-800">
            Shop Status Distribution (Active/Inactive)
          </h3>
          {/* Component for the Dynamic Donut Chart */}
          {/* <ShopStatusDonutChart /> */}
        </div>
      </div>
    </div>
  );
}
