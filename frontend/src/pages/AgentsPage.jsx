// src/pages/AgentsPage.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../api/api";
import { toast } from "sonner";
import { X, User, Mail, Phone, MapPin, Map, Search, Clock } from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'recent', 'last7days'
  // --- End Filter States ---

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    state: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const states = [
    "Lagos",
    "Abuja",
    "Kano",
    "Rivers",
    "Oyo",
    "Kaduna",
    "Enugu",
    "Plateau",
    "Delta",
    "Imo",
  ];

  // Fetch agents from backend
  const fetchAgents = async () => {
    try {
      const res = await api.get("/accounts/agents/");
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      toast.error("Failed to load agents data.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };
  // Open Edit Modal with prefilled data
  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setFormData({
      first_name: agent.user?.first_name || "",
      last_name: agent.user?.last_name || "",
      email: agent.user?.email || "",
      phone_number: agent.phone_number || "",
      address: agent.address || "",
      state: agent.state || "",
      password: "", // leave blank (only change if entered)
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    if (!editingAgent) return;

    setIsSubmitting(true);
    try {
      // ✅ CORRECTED: Send a FLAT payload to match AgentSerializer
      const payload = {
        first_name: formData.first_name, // Flat field
        last_name: formData.last_name, // Flat field
        email: formData.email, // Flat field
        phone_number: formData.phone_number,
        address: formData.address,
        state: formData.state,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password; // Flat field
      }

      await api.patch(`/accounts/agents/${editingAgent.agent_id}/`, payload);

      toast.success("Agent updated successfully!");
      setIsEditModalOpen(false);
      setEditingAgent(null);
      fetchAgents();
    } catch (err) {
      // ✅ ADD THIS LOGGING BLOCK
      console.error("--- FULL API ERROR RESPONSE ---");
      if (err.response) {
        // This will print the exact validation error from Django
        console.error("Data:", err.response.data);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Error:", err.message);
      }
      console.error("-----------------------------");

      toast.error(
        err.response?.data?.detail ||
          "Failed to update agent. Check console for details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone_number ||
      !formData.address ||
      !formData.state ||
      !formData.password
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        state: formData.state,
        password: formData.password,
      };

      await api.post("/accounts/agents/", payload);
      toast.success("Agent added successfully!");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        address: "",
        state: "",
        password: "",
      });
      setIsModalOpen(false);
      fetchAgents(); // Refetch to update list
    } catch (err) {
      console.error("Failed to add agent:", err);
      toast.error(err.response?.data?.detail || "Failed to add agent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // --- Filtering Logic (useMemo for performance) ---
  const filteredAgents = useMemo(() => {
    let currentAgents = agents;

    // 1. Filter by Status (Active/Inactive)
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      currentAgents = currentAgents.filter(
        (agent) => agent.is_active === isActive
      );
    }

    // 2. Filter by Name/Email/ID (Search Term)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentAgents = currentAgents.filter((agent) => {
        const fullName = `${agent.user?.first_name} ${agent.user?.last_name}`.toLowerCase();
        const email = agent.user?.email.toLowerCase();
        const agentId = agent.agent_id.toLowerCase();

        return (
          fullName.includes(lowerCaseSearchTerm) ||
          email.includes(lowerCaseSearchTerm) ||
          agentId.includes(lowerCaseSearchTerm)
        );
      });
    }

    // 3. Filter by Date (data_created)
    if (dateFilter !== "all") {
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      let filterDate = new Date(0); // Default to past date

      if (dateFilter === "recent") {
        // "Recent" will be defined as the last 24 hours
        filterDate = new Date(now.getTime() - oneDay);
      } else if (dateFilter === "last7days") {
        // "Last 7 Days"
        filterDate = new Date(now.getTime() - 7 * oneDay);
      }

      currentAgents = currentAgents.filter((agent) => {
        const createdDate = new Date(agent.data_created);
        return createdDate >= filterDate;
      });
    }

    return currentAgents;
  }, [agents, searchTerm, statusFilter, dateFilter]);
  // --- End Filtering Logic ---

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Agents Management
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add Agent</span>
          </button>
        </div>

        {/* ⭐️ Filter Controls Section */}
        <div className="mb-6 p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-grow min-w-[180px] sm:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-gray-900 focus:border-gray-900"
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0">
            <User className="w-4 h-4 text-gray-500 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0">
            <Clock className="w-4 h-4 text-gray-500 hidden sm:block" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="all">All Dates</option>
              <option value="recent">Recent (24h)</option>
              <option value="last7days">Last 7 Days</option>
            </select>
          </div>

          {/* Clear Button */}
          {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="flex items-center justify-center space-x-1 text-sm text-red-600 hover:text-red-800 mt-2 sm:mt-0"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
        {/* ⭐️ End Filter Controls Section */}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-[spin_0.5s_linear_infinite] mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {agents.length > 0
              ? "No agents match the current filter criteria."
              : "No agents found."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">State</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAgents.map((agent) => (
                  <tr key={agent.agent_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 whitespace-nowrap">{agent.agent_id}</td>
                    <td className="px-4 sm:px-6 py-3 text-gray-700 whitespace-nowrap">
                      {agent.user?.first_name} {agent.user?.last_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gray-700 whitespace-nowrap">{agent.phone_number || "N/A"}</td>
                    <td className="px-4 sm:px-6 py-3 text-gray-700 whitespace-nowrap hidden md:table-cell">{agent.state || "—"}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs sm:text-sm font-semibold rounded-full ${
                          agent.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 space-x-2">
                      <button
                        onClick={() => handleViewAgent(agent)}
                        className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="text-blue-600 hover:text-blue-900 text-sm sm:text-base"
                      >
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 text-sm sm:text-base">
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

      {/* Add Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span>Add New Agent</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ⭐️ UPDATED: Using handleAddAgent */}
            <form onSubmit={handleAddAgent} className="space-y-6">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="agent@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="e.g., 0803 123 4567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Address (Full Width) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter full address"
                    required
                  />
                </div>
              </div>

              {/* Row 4: state (Full Width) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  state
                </label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                    required
                  >
                    <option value="">Select a state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Password (Full Width) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter secure password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Adding..." : "Add Agent"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Agent Modal */}
      {isViewModalOpen && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span>Agent Details</span>
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Full Name:</span>
                  <br /> {selectedAgent.user?.first_name}{" "}
                  {selectedAgent.user?.last_name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>
                  <br /> {selectedAgent.user?.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Phone:</span>
                  <br /> {selectedAgent.phone_number || "N/A"}
                </p>
                <p>
                  <span className="font-medium">state:</span>
                  <br /> {selectedAgent.state || "—"}
                </p>
              </div>

              <div>
                <p>
                  <span className="font-medium">Address:</span>
                  <br /> {selectedAgent.address || "—"}
                </p>
              </div>

              <div>
                <p>
                  <span className="font-medium">Status:</span>
                  <br />
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedAgent.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedAgent.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Agent Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span>Edit Agent</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAgent} className="space-y-6">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Address & state */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    state
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white"
                    required
                  >
                    <option value="">Select state</option>
                    {states.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Password (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter new password if changing"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}