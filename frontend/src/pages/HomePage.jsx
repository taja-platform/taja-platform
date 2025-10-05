// src/pages/HomePage.jsx
import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/specifics/StatCard";
import { UsersIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import api from "../api/api";

export default function HomePage() {
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
        const res = await api.get("/shops/shops/");
        setShopCount(res.data.length); // assuming your endpoint returns a list of shops
      } catch (err) {
        console.error("Failed to fetch shops count:", err);
      }
    };

    fetchShops();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Overview</h2>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shops"
          value={shopCount.toLocaleString()}
          icon={BuildingStorefrontIcon}
        />
        <div
          onClick={() => navigate("/agents")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Total Agents"
            value={agentCount.toLocaleString()}
            icon={UsersIcon}
          />
        </div>
      </div>

      {/* Charts and Quick Links */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold mb-4">Shops by Region</h3>
          {/* Recharts chart component would go here */}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          {/* Quick link buttons would go here */}
        </div>
      </div>
    </div>
  );
}
