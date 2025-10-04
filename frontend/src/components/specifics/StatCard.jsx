// src/components/specific/StatCard.jsx
export default function StatCard({ title, value, icon: Icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="bg-gray-100 rounded-full p-3">
                    <Icon className="w-6 h-6 text-gray-700" />
                </div>
            </div>
        </div>
    );
}