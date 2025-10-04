// src/pages/AgentsPage.jsx
// Dummy data - in a real app, this comes from an API call
const agents = [
    { id: 'AGT-001', name: 'John Doe', phone: '123-456-7890', region: 'Lagos', status: 'Active' },
    { id: 'AGT-002', name: 'Jane Smith', phone: '098-765-4321', region: 'Abuja', status: 'Inactive' },
];

export default function AgentsPage() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Agents Management</h2>
                <button className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800">
                    + Add Agent
                </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agents.map((agent) => (
                            <tr key={agent.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agent.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agent.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agent.region}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {agent.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <a href="#" className="text-gray-600 hover:text-gray-900">View</a>
                                    <a href="#" className="text-blue-600 hover:text-blue-900">Edit</a>
                                    <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}