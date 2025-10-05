// src/pages/ShopsPage.jsx
import React, { useState } from 'react';
// import ShopMap from '../components/ShopMap';
import ShopTable from '../components/ShopTable';


// --- Tab Widget Component (optional, for clean code) ---
const TabButton = ({ isActive, onClick, children }) => {
    const activeClasses = "text-indigo-600 border-b-2 border-indigo-600 font-semibold";
    const inactiveClasses = "text-gray-500 hover:text-gray-700 hover:border-gray-300";

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm transition-colors duration-150 ${
                isActive ? activeClasses : inactiveClasses
            }`}
        >
            {children}
        </button>
    );
};


// --- Main Page Component ---
export default function ShopsPage() {
    // 1. State Management for the active tab
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'map'

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Shops Management</h2>
            </div>
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-t-2xl border border-gray-200 mb-0 flex justify-between items-center">
                <div className="flex space-x-4">
                    <select className="border-gray-300 rounded-lg">
                        <option>Filter by State</option>
                        {/* ...options */}
                    </select>
                    <select className="border-gray-300 rounded-lg">
                        <option>Filter by Agent</option>
                        {/* ...options */}
                    </select>
                    {/* Additional filters can go here */}
                </div>

                {/* Optional: Add a 'Capture New Shop' button here */}
            </div>

            {/* 2. Tab Widget Container */}
            <div className="bg-white border-b border-gray-200 px-4 pt-2">
                <div className="flex -mb-px space-x-4">
                    <TabButton 
                        isActive={activeTab === 'manage'} 
                        onClick={() => setActiveTab('manage')}
                    >
                        📝 Manage Shops
                    </TabButton>
                    <TabButton 
                        isActive={activeTab === 'map'} 
                        onClick={() => setActiveTab('map')}
                    >
                        🗺️ View Map
                    </TabButton>
                </div>
            </div>

            {/* 3. Conditional Content Rendering */}
            <div className="bg-white p-6 rounded-b-2xl border border-t-0 border-gray-200">
                {activeTab === 'manage' && (
                    <div className="w-full">
                        <h3 className="font-semibold mb-4">All Shops (Table View)</h3>

                        <ShopTable/>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="w-full">
                        <h3 className="font-semibold mb-4">Shops Location Map</h3>
                        {/* Replace this placeholder with your actual ShopMap component */}
                        <div className="bg-gray-200 h-96 w-full flex items-center justify-center text-gray-500 rounded-lg">
                            Map Placeholder (e.g., ShopMap component with React-Leaflet)
                        </div>
                        {/* <ShopMap shops={shopsData} /> */}
                    </div>
                )}
            </div>
        </div>
    );
}