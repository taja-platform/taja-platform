import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UsersIcon, 
  BuildingStorefrontIcon, 
  ClockIcon, 
  XCircleIcon,
  CalendarIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import StatCard from "../../components/specifics/StatCard";
import api from "../../api/api";

export default function AdminDashboard() {
  // 1. Consolidate state into a single object matching the API response
  const [stats, setStats] = useState({
    total_shops: 0,
    total_agents: 0,
    pending_reviews: 0,
    rejected_reviews: 0,
    verified_shops: 0,
    shops_captured_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 2. Fetch all stats in one efficient request
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Calls the new optimized Django endpoint
        const res = await api.get("/shops/stats/");
        setStats(res.data.global_overview);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        🚀 Dashboard Overview
      </h2>

      {/* 1. HERO SECTION: KPI Cards */}
      {/* Expanded to grid-cols-5 to fit the new metrics specifically requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        
        {/* Total Shops */}
        <div
          onClick={() => navigate("/shops")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Total Shops"
            value={loading ? "..." : stats.total_shops.toLocaleString()}
            icon={BuildingStorefrontIcon}
            color="text-blue-600" // Optional: passing color props if your StatCard supports it
          />
        </div>

        {/* Total Agents */}
        <div
          onClick={() => navigate("/agents")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Total Agents"
            value={loading ? "..." : stats.total_agents.toLocaleString()}
            icon={UsersIcon}
            color="text-indigo-600"
          />
        </div>

        {/* Pending Reviews (Action Item) */}
        <div
          // Navigate to shops page pre-filtered for pending (assuming your list page handles query params)
          onClick={() => navigate("/shops?status=PENDING")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Pending Reviews"
            value={loading ? "..." : stats.pending_reviews.toLocaleString()}
            icon={ClockIcon}
            // Highlight this card if there are pending items
            className={stats.pending_reviews > 0 ? "ring-2 ring-orange-400" : ""}
            color="text-orange-500"
          />
        </div>

        {/* Rejected Reviews */}
        <div
          onClick={() => navigate("/shops?status=REJECTED")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Rejected"
            value={loading ? "..." : stats.rejected_reviews.toLocaleString()}
            icon={XCircleIcon}
            color="text-red-500"
          />
        </div>

        {/* Captured Today (Velocity Metric) */}
        <div className="cursor-default">
           <StatCard
            title="Captured Today"
            value={loading ? "..." : stats.shops_captured_today.toLocaleString()}
            icon={CalendarIcon}
            color="text-green-600"
            // Example: Show a small text indicating active momentum
            growthRate={stats.shops_captured_today > 0 ? "Active" : "Quiet"} 
          />
        </div>

      </div>

      {/* 2. CORE VISUALIZATIONS SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization (Occupies 2/3 of the row) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold mb-4 text-gray-800">
            Shop Density by State 🌍
          </h3>
          {/* <ShopDensityMap />  */}
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
            Map Placeholder
          </div>
        </div>

        {/* Top 10 Bar Chart (Occupies 1/3 of the row) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h3 className="font-semibold mb-4 text-gray-800">
            Top Performing States
          </h3>
          {/* <TopStatesBarChart /> */}
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
            Chart Placeholder
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-96">
          <h3 className="font-semibold mb-4 text-gray-800">
            Agent Performance Snapshot 🎯
          </h3>
           <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
            Bubble Chart Placeholder
          </div>
        </div>

        {/* Shop Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-96">
          <h3 className="font-semibold mb-4 text-gray-800">
            Shop Status Distribution
          </h3>
           <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
            Donut Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}