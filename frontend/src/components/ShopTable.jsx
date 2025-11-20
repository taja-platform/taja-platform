// src/components/ShopTable.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";
import {
  MapPin, Phone, Store, Zap, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import { format, subDays } from "date-fns";
import ShopDetailsModal from "./modals/ShopDetailsModal"; 

export default function ShopTable({ filters }) {
  const [rawShops, setRawShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShop, setSelectedShop] = useState(null); 

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
        setRawShops([]);
        setFilteredShops([]);
      }
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      toast.error("Failed to load shops data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, []);

  // 1. Page Reset Logic: Only when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // 2. Filtering Logic: Runs when filters OR rawShops data changes
  useEffect(() => {
    let currentFilteredShops = [...rawShops];

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      currentFilteredShops = currentFilteredShops.filter((shop) => {
        return (
          shop.name?.toLowerCase().includes(lowerSearch) ||
          shop.phone_number?.toLowerCase().includes(lowerSearch) ||
          shop.address?.toLowerCase().includes(lowerSearch) ||
          shop.state?.toLowerCase().includes(lowerSearch) ||
          shop.local_government_area?.toLowerCase().includes(lowerSearch) ||
          String(shop.owner || "").toLowerCase().includes(lowerSearch) ||
          String(shop.created_by || "").toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (filters.state && filters.state !== "all") {
        currentFilteredShops = currentFilteredShops.filter(s => s.state === filters.state);
    }
    if (filters.lga && filters.lga !== "all") {
        currentFilteredShops = currentFilteredShops.filter(s => s.local_government_area === filters.lga);
    }
    if (filters.status && filters.status !== "all") {
        const isActive = filters.status === "true";
        currentFilteredShops = currentFilteredShops.filter(s => s.is_active === isActive);
    }
    if (filters.agent && filters.agent !== "all") {
        currentFilteredShops = currentFilteredShops.filter(s => String(s.created_by_id) === filters.agent);
    }
    if (filters.dateRange && filters.dateRange !== "all") {
         const now = new Date();
        let cutoffDate;
        if (filters.dateRange === "last_7d") cutoffDate = subDays(now, 7);
        else if (filters.dateRange === "last_30d") cutoffDate = subDays(now, 30);
        else if (filters.dateRange === "last_90d") cutoffDate = subDays(now, 90);
        if (cutoffDate) {
            currentFilteredShops = currentFilteredShops.filter(s => new Date(s.date_created) >= cutoffDate);
        }
    }

    setFilteredShops(currentFilteredShops);
  }, [filters, rawShops]);


  const indexOfLastShop = currentPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);
  const totalPages = Math.ceil(filteredShops.length / shopsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- HANDLERS ---

  // 3. Handler to update a single shop in the list without refetching
  const handleShopUpdate = (updatedShop) => {
    setRawShops((prevShops) => 
        prevShops.map((shop) => shop.id === updatedShop.id ? updatedShop : shop)
    );
    // Also update the selected shop if it's the one being viewed
    if (selectedShop && selectedShop.id === updatedShop.id) {
        setSelectedShop(updatedShop);
    }
  };

  const handleRowClick = (shop) => {
    setSelectedShop(shop);
  };

  const handleCloseModal = () => {
    setSelectedShop(null);
  };

  const handleDeleteShop = (shop, e) => {
      e.stopPropagation(); 
      console.log("Deleting", shop.name);
  }
  
  const handleEditShop = (shop, e) => {
      e.stopPropagation(); 
      console.log("Editing", shop.name);
  }


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
        <p className="text-gray-500 text-sm p-4 text-center border border-gray-200 rounded-xl mt-2 bg-gray-50">No shops found matching the criteria.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Store className="w-4 h-4 inline mr-1" /> Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><MapPin className="w-4 h-4 inline mr-1" /> Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Phone className="w-4 h-4 inline mr-1" /> Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentShops.map((shop) => (
                  <tr 
                    key={shop.id} 
                    onClick={() => handleRowClick(shop)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shop.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shop.local_government_area}, {shop.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shop.phone_number || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-[150px] truncate" title={shop.created_by}>
                        {shop.created_by?.split('@')[0] || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shop.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {shop.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shop.date_created ? format(new Date(shop.date_created), "MMM d, yyyy") : "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); handleRowClick(shop); }} className="text-gray-400 hover:text-indigo-600 p-1" title="View Details">
                            <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => handleEditShop(shop, e)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onClick={(e) => handleDeleteShop(shop, e)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="mt-4 px-4 py-3 bg-white sm:px-6">{renderPaginationButtons()}</div>}
        </>
      )}

      {/* RENDER THE MODAL: PASS onUpdate */}
      {selectedShop && (
        <ShopDetailsModal 
            shop={selectedShop} 
            onClose={handleCloseModal} 
            onUpdate={handleShopUpdate} // Pass the updater function
        />
      )}
    </div>
  );
}