// src/components/ShopTable.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api"; 
import { toast } from "sonner";
import { MapPin, Phone, Store, Zap } from "lucide-react"; 
import { format } from "date-fns"; 
export default function ShopTable() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    // Placeholder for action handlers (View, Edit, Delete)
    const handleViewShop = (shop) => {
        // Implement logic to open a View Modal (similar to AgentsPage)
        console.log("Viewing shop:", shop.name);
    };

    const handleEditShop = (shop) => {
        // Implement logic to open an Edit Modal
        console.log("Editing shop:", shop.name);
    };

    const handleDeleteShop = (shop) => {
        // Implement logic to confirm and delete the shop
        console.log("Deleting shop:", shop.name);
    };

    // Fetch shops from backend
    const fetchShops = async () => {
        setLoading(true);
        try {
            // Note: Adjust the API endpoint as necessary, assuming '/shops/' is correct from urls.py
            const res = await api.get("/shops/shops/"); 
            setShops(res.data);
            console.log("Shops data fetched successfully:", res.data);
        } catch (err) {
            console.error("Failed to fetch shops:", err);
            toast.error("Failed to load shops data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    return (
        <div className="bg-white p-0 rounded-2xl">
            {/* Loading State */}
            {loading ? (
                <div className="p-10 text-center">
                    <Zap className="w-6 h-6 animate-spin text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading shops data...</p>
                </div>
            ) : shops.length === 0 ? (
                <p className="text-gray-500 text-sm p-4">No shops found matching the criteria.</p>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Store className="w-4 h-4 inline mr-1" /> Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <MapPin className="w-4 h-4 inline mr-1" /> Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Phone className="w-4 h-4 inline mr-1" /> Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner / Agent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {shops.map((shop) => (
                                <tr key={shop.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {shop.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {shop.state}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {shop.phone_number || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {shop.owner || shop.created_by || "Unassigned"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                shop.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {shop.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* Format the date for better display */}
                                        {shop.date_created ? format(new Date(shop.date_created), 'MMM d, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleViewShop(shop)}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEditShop(shop)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteShop(shop)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

