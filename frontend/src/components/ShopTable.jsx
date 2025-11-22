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
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { format, subDays } from "date-fns";
import ShopDetailsModal from "./modals/ShopDetailsModal";

// Bulk Action Modal Component
const BulkActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  selectedCount,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (action === "REJECTED" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    onConfirm(rejectionReason);
    setRejectionReason("");
    setError("");
  };

  const handleClose = () => {
    setRejectionReason("");
    setError("");
    onClose();
  };

  const getModalConfig = () => {
    switch (action) {
      case "VERIFIED":
        return {
          title: "Verify Selected Shops",
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          message: `Are you sure you want to verify ${selectedCount} shop${
            selectedCount > 1 ? "s" : ""
          }?`,
          confirmText: "Verify",
          confirmClass: "bg-green-600 hover:bg-green-700 text-white",
        };
      case "REJECTED":
        return {
          title: "Reject Selected Shops",
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          message: `You are about to reject ${selectedCount} shop${
            selectedCount > 1 ? "s" : ""
          }.`,
          confirmText: "Reject",
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
          showInput: true,
        };
      case "DELETE":
        return {
          title: "Delete Selected Shops",
          icon: <Trash2 className="w-6 h-6 text-gray-800" />,
          message: `Are you sure you want to delete ${selectedCount} shop${
            selectedCount > 1 ? "s" : ""
          }? This action cannot be undone.`,
          confirmText: "Delete",
          confirmClass: "bg-gray-800 hover:bg-gray-900 text-white",
        };
      default:
        return {};
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">{config.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {config.title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">{config.message}</p>

            {config.showInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="3"
                />
                {error && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${config.confirmClass}`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ShopTable({ filters }) {
  const [rawShops, setRawShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // State for the currently open modal
  const [selectedShop, setSelectedShop] = useState(null);

  // Bulk action modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [currentBulkAction, setCurrentBulkAction] = useState(null);

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

  const handleOpenBulkModal = (action) => {
    if (selectedIds.length === 0) return;
    setCurrentBulkAction(action);
    setBulkModalOpen(true);
  };

  const handleBulkAction = async (reason = "") => {
    if (selectedIds.length === 0) return;

    const updates = selectedIds.map(async (id) => {
      try {
        const payload =
          currentBulkAction === "REJECTED"
            ? { verification_status: "REJECTED", rejection_reason: reason }
            : { verification_status: currentBulkAction };

        await api.patch(`/shops/${id}/`, payload);
        return id;
      } catch (err) {
        console.error("Bulk update failed for", id, err);
        return null;
      }
    });

    await Promise.all(updates);

    toast.success(`Bulk ${currentBulkAction.toLowerCase()} completed`);

    // Refresh list visually
    fetchShops();
    setSelectedIds([]);
    setBulkModalOpen(false);
    setCurrentBulkAction(null);
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
  const handleShopUpdate = (updatedShop) => {
    setRawShops((prevShops) =>
      prevShops.map((shop) => (shop.id === updatedShop.id ? updatedShop : shop))
    );
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
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl m-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {selectedIds.length}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedIds.length} shop{selectedIds.length > 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenBulkModal("VERIFIED")}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Verify
                  </button>

                  <button
                    onClick={() => handleOpenBulkModal("REJECTED")}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleOpenBulkModal("DELETE")}
                    className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
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

      {/* Shop Details Modal */}
      {selectedShop && (
        <ShopDetailsModal
          shop={selectedShop}
          onClose={handleCloseModal}
          onUpdate={handleShopUpdate}
        />
      )}

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={bulkModalOpen}
        onClose={() => {
          setBulkModalOpen(false);
          setCurrentBulkAction(null);
        }}
        onConfirm={handleBulkAction}
        action={currentBulkAction}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}
