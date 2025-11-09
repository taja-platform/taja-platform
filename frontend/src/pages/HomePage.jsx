// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/specifics/StatCard";
import { UsersIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import api from "../api/api";

export default function HomePage() {
  const [agentCount, setAgentCount] = useState(0);
  const [shopCount, setShopCount] = useState(0); 
  const navigate = useNavigate();

  // Fetch agents count
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get("/accounts/agents/");
        // Use optional chaining just in case for safer access if the endpoint response is inconsistent
        setAgentCount(res.data?.length ?? 0); 
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
        setShopCount(res.data?.length ?? 0); 
      } catch (err) {
        console.error("Failed to fetch shops count:", err);
      }
    };

    fetchShops();
  }, []);

  return (
    // P-4 is a good default for mobile, then p-6 for desktop
    <div className="p-4 md:p-6"> 
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
        🚀 Dashboard Overview
      </h2>

      {/* 1. HERO SECTION: Stat Cards Grid */}
      {/* Changed to sm:grid-cols-2 to utilize smaller screen width better, 
          and kept lg:grid-cols-4 for full desktop width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Total Shops Card */}
        <div
          onClick={() => navigate("/agents")}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg rounded-2xl"
        >
          <StatCard
            title="Total Shops"
            value={shopCount.toLocaleString()}
            icon={BuildingStorefrontIcon}
            growthRate={12}
          />
        </div>

        {/* Total Agents Card */}
        <div
          onClick={() => navigate("/agents")}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg rounded-2xl"
        >
          <StatCard
            title="Total Agents"
            value={agentCount.toLocaleString()}
            icon={UsersIcon}
            growthRate={-3}
          />
        </div>
        
        {/* Placeholder cards for consistent layout demonstration */}
        <div className="hidden sm:block"> {/* Hide placeholders on smaller mobile devices */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 h-full flex items-center justify-center text-sm text-gray-400">
                Onboarding Rate Chart
            </div>
        </div>
        <div className="hidden lg:block"> {/* Only show this placeholder on larger screens */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 h-full flex items-center justify-center text-sm text-gray-400">
                New Shops Line Chart
            </div>
        </div>

      </div>

      {/* 2. CORE VISUALIZATIONS SECTION */}
      {/* Use grid-cols-1 for mobile, then lg:grid-cols-3 for desktop layout */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Map Visualization (Occupies 2/3 of the row on large screens) */}
        {/* Added a minimum height h-64 to prevent it from collapsing on mobile */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 h-64 lg:h-96">
          <h3 className="font-semibold mb-4 text-gray-800 text-lg">
            Shop Density by State 🌍
          </h3>
          <div className="text-gray-400">
            {/* <ShopDensityMap /> */}
            [Map Placeholder]
          </div>
        </div>

        {/* Top 10 Bar Chart (Occupies 1/3 of the row on large screens) */}
        {/* Added a minimum height h-64 to prevent it from collapsing on mobile */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 h-64 lg:h-96">
          <h3 className="font-semibold mb-4 text-gray-800 text-lg">
            Top Performing States
          </h3>
          <div className="text-gray-400">
            {/* <TopStatesBarChart /> */}
            [Bar Chart Placeholder]
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE SECTION */}
      {/* Use grid-cols-1 for mobile, then lg:grid-cols-2 for desktop layout */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Agent Performance Scatter Plot */}
        {/* Added a consistent height h-80 for mobile and desktop for visual balance */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 h-80">
          <h3 className="font-semibold mb-4 text-gray-800 text-lg">
            Agent Performance Snapshot 🎯
          </h3>
          <div className="text-gray-400">
            {/* <AgentPerformanceBubbleChart /> */}
            [Scatter Plot Placeholder]
          </div>
        </div>

        {/* Shop Status Distribution */}
        {/* Added a consistent height h-80 for mobile and desktop for visual balance */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 h-80">
          <h3 className="font-semibold mb-4 text-gray-800 text-lg">
            Shop Status Distribution
          </h3>
          <div className="text-gray-400">
            {/* <ShopStatusDonutChart /> */}
            [Donut Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
}