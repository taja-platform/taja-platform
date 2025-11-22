// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Store, 
  Clock, 
  XCircle, 
  Calendar, 
  CheckCircle2, 
  Map as MapIcon, 
  BarChart3, 
  Globe2, 
  TrendingUp,
  LayoutDashboard,
  ArrowUpRight,
  Activity
} from "lucide-react";
import api from "../../api/api";

// --- Internal Components for Sleek UI ---

const DashboardCard = ({ title, value, icon: Icon, color, bg, onClick, subtext }) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-6 h-6" />
      </div>
      {subtext && (
        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3 mr-1" />
          {subtext}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ChartPlaceholder = ({ icon: Icon, title, description }) => (
  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
    <div className="bg-white p-4 rounded-full shadow-sm mb-4 ring-1 ring-gray-100">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h4 className="text-gray-900 font-medium mb-1">{title}</h4>
    <p className="text-gray-500 text-sm max-w-xs">{description}</p>
  </div>
);

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white h-32 rounded-2xl border border-gray-100 p-5">
        <div className="h-10 w-10 bg-gray-100 rounded-xl mb-4"></div>
        <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
        <div className="h-8 w-16 bg-gray-100 rounded"></div>
      </div>
    ))}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_shops: 0,
    active_shops: 0,  
    total_agents: 0,
    pending_reviews: 0,
    rejected_reviews: 0,
    verified_shops: 0,
    shops_captured_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  // Calculate quick metrics for UI styling
  const activeRate = stats.total_shops > 0 
    ? Math.round((stats.active_shops / stats.total_shops) * 100) 
    : 0;

  return (
    <div className="p-3 md:p-6  max-w-[1600px] mx-auto space-y-8">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h2>
            <p className="text-sm text-gray-500">Welcome back, here's what's happening today.</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* 1. KPI SECTION */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Total Shops */}
          <DashboardCard
            title="Total Shops"
            value={stats.total_shops.toLocaleString()}
            icon={Store}
            color="text-blue-600"
            bg="bg-blue-50"
            onClick={() => navigate("/shops")}
            subtext={`${stats.shops_captured_today} new today`}
          />

          {/* Active Shops */}
          <DashboardCard
            title="Active Shops"
            value={stats.active_shops.toLocaleString()}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
            onClick={() => navigate("/shops?is_active=true")}
            subtext={`${activeRate}% operational`}
          />

          {/* Total Agents */}
          <DashboardCard
            title="Total Agents"
            value={stats.total_agents.toLocaleString()}
            icon={Users}
            color="text-indigo-600"
            bg="bg-indigo-50"
            onClick={() => navigate("/agents")}
          />

          {/* Pending Reviews */}
          <DashboardCard
            title="Pending Reviews"
            value={stats.pending_reviews.toLocaleString()}
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
            onClick={() => navigate("/shops?status=PENDING")}
            subtext="Requires attention"
          />
        </div>
      )}

      {/* Secondary Stats Row (Rejected & Today) */}
      {!loading && (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div 
                onClick={() => navigate("/shops?status=REJECTED")}
                className="bg-white p-4 rounded-xl border border-red-100 bg-red-50/30 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Rejected Shops</p>
                        <p className="text-lg font-bold text-gray-900">{stats.rejected_reviews.toLocaleString()}</p>
                    </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-red-300" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Captured Today</p>
                        <p className="text-lg font-bold text-gray-900">{stats.shops_captured_today.toLocaleString()}</p>
                    </div>
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    Daily Metric
                </span>
            </div>
         </div>
      )}

      {/* 2. VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Visualization (Occupies 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Geographic Distribution</h3>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Full Map</button>
          </div>
          
          <ChartPlaceholder 
            icon={MapIcon} 
            title="Interactive Map Loading..." 
            description="Visualizing shop density across regions." 
          />
        </div>

        {/* Top States (Occupies 1/3) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
             <BarChart3 className="h-5 w-5 text-gray-500" />
             <h3 className="font-semibold text-gray-900">Top Locations</h3>
          </div>

          <ChartPlaceholder 
            icon={TrendingUp} 
            title="Ranking Data" 
            description="Top performing states and LGAs will appear here." 
          />
        </div>
      </div>
    </div>
  );
}