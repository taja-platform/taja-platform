// src/components/ShopTable.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Store,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format, subDays } from "date-fns";
import ShopDetailsModal from "./modals/ShopDetailsModal";

export default function ShopTable({ filters }) {
  const [rawShops, setRawShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // State for the currently open modal
  const [selectedShop, setSelectedShop] = useState(null);

  const shopsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState([]);
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === currentShops.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentShops.map((s) => s.id));
    }
  };

  const handleBulkAction = async (action, reason = "") => {
    if (selectedIds.length === 0) return;

    const updates = selectedIds.map(async (id) => {
      try {
        const payload =
          action === "REJECTED"
            ? { verification_status: "REJECTED", rejection_reason: reason }
            : { verification_status: action };

        await api.patch(`/shops/${id}/`, payload);
        return id;
      } catch (err) {
        console.error("Bulk update failed for", id, err);
        return null;
      }
    });

    await Promise.all(updates);

    toast.success(`Bulk ${action.toLowerCase()} completed`);

    // Refresh list visually
    fetchShops();
    setSelectedIds([]);
  };

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

  useEffect(() => {
    fetchShops();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    let currentFilteredShops = [...rawShops];

    // 1. Verification Status (Matches the Tabs)
    if (filters.verification_status && filters.verification_status !== "ALL") {
      currentFilteredShops = currentFilteredShops.filter(
        (shop) => shop.verification_status === filters.verification_status
      );
    }

    // 2. Search (Name, Phone, Address, Agent)
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      currentFilteredShops = currentFilteredShops.filter((shop) => {
        return (
          shop.name?.toLowerCase().includes(lowerSearch) ||
          shop.phone_number?.toLowerCase().includes(lowerSearch) ||
          shop.address?.toLowerCase().includes(lowerSearch) ||
          shop.state?.toLowerCase().includes(lowerSearch) ||
          shop.local_government_area?.toLowerCase().includes(lowerSearch) ||
          String(shop.owner || "")
            .toLowerCase()
            .includes(lowerSearch) ||
          String(shop.created_by || "")
            .toLowerCase()
            .includes(lowerSearch)
        );
      });
    }

    // 3. Other Dropdown Filters
    if (filters.state && filters.state !== "all") {
      currentFilteredShops = currentFilteredShops.filter(
        (s) => s.state === filters.state
      );
    }
    if (filters.lga && filters.lga !== "all") {
      currentFilteredShops = currentFilteredShops.filter(
        (s) => s.local_government_area === filters.lga
      );
    }
    if (filters.agent && filters.agent !== "all") {
      currentFilteredShops = currentFilteredShops.filter(
        (s) => String(s.created_by_id) === filters.agent
      );
    }
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate;
      if (filters.dateRange === "last_7d") cutoffDate = subDays(now, 7);
      else if (filters.dateRange === "last_30d") cutoffDate = subDays(now, 30);
      else if (filters.dateRange === "last_90d") cutoffDate = subDays(now, 90);
      if (cutoffDate) {
        currentFilteredShops = currentFilteredShops.filter(
          (s) => new Date(s.date_created) >= cutoffDate
        );
      }
    }

    setFilteredShops(currentFilteredShops);
  }, [filters, rawShops]);

  // Pagination
  const indexOfLastShop = currentPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);
  const totalPages = Math.ceil(filteredShops.length / shopsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- LIVE UPDATE HANDLER ---
  // This function is passed to the Modal. When the modal updates a shop,
  // we update our local state here so the table reflects the change immediately.
  const handleShopUpdate = (updatedShop) => {
    setRawShops((prevShops) =>
      prevShops.map((shop) => (shop.id === updatedShop.id ? updatedShop : shop))
    );
    // Also update the selected shop state to keep the modal in sync if needed
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
  };
  const handleEditShop = (shop, e) => {
    e.stopPropagation();
    console.log("Editing", shop.name);
  };

  const renderPaginationButtons = () => (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5 mr-2" /> Previous
      </button>
      <div className="hidden sm:flex space-x-1">
        <span className="text-sm font-medium text-gray-700 py-2 px-3">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        Next <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </nav>
  );

  // Helper to render status badges in the table
  const StatusCell = ({ status }) => {
    if (status === "VERIFIED")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Verified
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3 mr-1" /> Pending
      </span>
    );
  };

  return (
    <div className="bg-white p-0 rounded-2xl">
      {loading ? (
        <div className="p-10 text-center">
          <Zap className="w-6 h-6 animate-spin text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading shops...</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
          <p className="text-gray-500 text-sm">
            No shops found in this category.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between mb-3 p-3 bg-gray-100 border border-gray-300 rounded-xl">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.length} selected
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("VERIFIED")}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm"
                  >
                    Verify Selected
                  </button>

                  <button
                    onClick={() => {
                      const reason = prompt("Rejection reason:");
                      if (reason) handleBulkAction("REJECTED", reason);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm"
                  >
                    Reject Selected
                  </button>

                  <button
                    onClick={() => handleBulkAction("DELETE")}
                    className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === currentShops.length &&
                        currentShops.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>

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
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentShops.map((shop) => (
                  <tr
                    key={shop.id}
                    onClick={() => handleRowClick(shop)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(shop.id)}
                        onChange={() => toggleSelect(shop.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shop.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {shop.local_government_area}, {shop.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {shop.phone_number || "N/A"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-[150px] truncate"
                      title={shop.created_by}
                    >
                      {shop.created_by?.split("@")[0] || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusCell status={shop.verification_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shop.date_created
                        ? format(new Date(shop.date_created), "MMM d, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(shop);
                        }}
                        className="text-gray-400 hover:text-indigo-600 p-1"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleEditShop(shop, e)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteShop(shop, e)}
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
          {totalPages > 1 && (
            <div className="mt-4 px-4 py-3 bg-white sm:px-6">
              {renderPaginationButtons()}
            </div>
          )}
        </>
      )}

      {/* RENDER THE MODAL WITH LIVE UPDATE CALLBACK */}
      {selectedShop && (
        <ShopDetailsModal
          shop={selectedShop}
          onClose={handleCloseModal}
          onUpdate={handleShopUpdate}
        />
      )}
    </div>
  );
}
