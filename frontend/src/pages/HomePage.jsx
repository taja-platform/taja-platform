// src/pages/HomePage.jsx
import StatCard from '../components/specifics/StatCard';
import { UsersIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'; // Example icons

export default function HomePage() {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Overview</h2>
            {/* Analytics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Shops" value="1,240" icon={BuildingStorefrontIcon} />
                <StatCard title="Total Agents" value="86" icon={UsersIcon} />
                {/* Add more cards */}
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