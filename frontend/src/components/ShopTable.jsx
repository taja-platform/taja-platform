// src/components/ShopTable.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api"; // Ensure this path is correct
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Store,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, subDays } from "date-fns";

// Accept filters as a prop
export default function ShopTable({ filters }) {
  const [rawShops, setRawShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const shopsPerPage = 10;

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shops/");
      let shopData = res.data?.results || res.data || [];
      if (Array.isArray(shopData)) {
        setRawShops(shopData);
        setFilteredShops(shopData);
      } else {
        console.warn("API response was not an array:", res.data);
        setRawShops([]);
        setFilteredShops([]);
      }
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      toast.error("Failed to load shops data.");
      setRawShops([]);
      setFilteredShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // --- Filtering Logic (Runs when filters or raw data change) ---
  useEffect(() => {
    setCurrentPage(1); // Reset page to 1 whenever filters change
    let currentFilteredShops = [...rawShops];

    // 1. Filter by State
    if (filters.state && filters.state !== "all") {
      currentFilteredShops = currentFilteredShops.filter(
        (shop) => shop.state === filters.state
      );
    }
    
    // --- NEW: Filter by LGA ---
    if (filters.lga && filters.lga !== "all") {
        currentFilteredShops = currentFilteredShops.filter(
            (shop) => shop.local_government_area === filters.lga
        );
    }

    // 2. Filter by Status (is_active)
    if (filters.status && filters.status !== "all") {
      const isActive = filters.status === "true";
      currentFilteredShops = currentFilteredShops.filter(
        (shop) => shop.is_active === isActive
      );
    }
    
    // 3. Filter by Agent ID
    if (filters.agent && filters.agent !== 'all') {
        currentFilteredShops = currentFilteredShops.filter(shop => String(shop.created_by_id) === filters.agent);
    }

    // 4. Filter by Date Created
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate;
      if (filters.dateRange === "last_7d") cutoffDate = subDays(now, 7);
      else if (filters.dateRange === "last_30d") cutoffDate = subDays(now, 30);
      else if (filters.dateRange === "last_90d") cutoffDate = subDays(now, 90);
      if (cutoffDate) {
        currentFilteredShops = currentFilteredShops.filter((shop) => 
          new Date(shop.date_created) >= cutoffDate
        );
      }
    }

    setFilteredShops(currentFilteredShops);
  }, [filters, rawShops]);

  // Pagination logic and rendering... (omitted for brevity, no changes needed here)
  const indexOfLastShop = currentPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);
  const totalPages = Math.ceil(filteredShops.length / shopsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewShop = (shop) => console.log("Viewing shop:", shop.name);
  const handleEditShop = (shop) => console.log("Editing shop:", shop.name);
  const handleDeleteShop = (shop) => console.log("Deleting shop:", shop.name);

  // Render Functions
  const renderPaginationButtons = () => (
      <nav className="flex items-center justify-between" aria-label="Pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5 mr-2" /> Previous
          </button>
          <div className="hidden sm:flex space-x-1">
              <span className="text-sm font-medium text-gray-700 py-2 px-3">Page {currentPage} of {totalPages}</span>
          </div>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Next <ChevronRight className="w-5 h-5 ml-2" />
          </button>
      </nav>
  );

  return (
    <div className="bg-white p-0 rounded-2xl">
      {loading ? (
        <div className="p-10 text-center"><Zap className="w-6 h-6 animate-spin text-gray-500 mx-auto mb-2" /><p className="text-gray-500 text-sm">Loading shops...</p></div>
      ) : filteredShops.length === 0 ? (
        <p className="text-gray-500 text-sm p-4">No shops found matching the criteria.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Store className="w-4 h-4 inline mr-1" /> Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><MapPin className="w-4 h-4 inline mr-1" /> Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Phone className="w-4 h-4 inline mr-1" /> Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner / Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentShops.map((shop) => (
                  <tr key={shop.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shop.name}</td>
                    {/* UPDATED: Display both state and LGA */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shop.local_government_area}, {shop.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shop.phone_number || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shop.owner || shop.created_by || "Unassigned"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shop.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {shop.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shop.date_created ? format(new Date(shop.date_created), "MMM d, yyyy") : "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleViewShop(shop)} className="text-gray-600 hover:text-gray-900">View</button>
                        <button onClick={() => handleEditShop(shop)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onClick={() => handleDeleteShop(shop)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="mt-4 px-4 py-3 bg-white sm:px-6">{renderPaginationButtons()}</div>}
        </>
      )}
    </div>
  );
}
