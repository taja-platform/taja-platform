// src/components/ShopMap.jsx (Updated for Colored Markers)
import React, { useEffect, useState, useMemo } from 'react';
// ⭐ CRITICAL CHANGE: Imported Tooltip (for hover) instead of Popup
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import { MapPin, Store, Zap } from 'lucide-react'; 
import api from '../api/api';
import { toast } from 'sonner';
import { subDays } from 'date-fns';
import L from 'leaflet';

// Fix for default Leaflet marker icons not showing up in Webpack projects
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Custom Icon Definitions ---

// Helper function to create a custom L.divIcon with a colored map pin SVG
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-map-pin',
        html: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
                <circle cx="12" cy="10" r="3" fill="#FFFFFF" stroke="none"></circle>
            </svg>
        `,
        iconSize: [24, 24], // SVG size
        iconAnchor: [12, 24], // Point of the pin (center-bottom)
        tooltipAnchor: [0, -20], // Adjust tooltip position
    });
};

// Define the two static icons (Tailwind colors used for clarity)
const ACTIVE_COLOR = '#10B981'; // Green-500 for Active
const INACTIVE_COLOR = '#EF4444'; // Red-500 for Inactive

const ACTIVE_ICON = createCustomIcon(ACTIVE_COLOR);
const INACTIVE_ICON = createCustomIcon(INACTIVE_COLOR);

// Component to dynamically adjust the map view based on filtered markers
const SetBounds = ({ markers }) => {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const latLngs = markers.map(m => [parseFloat(m.latitude), parseFloat(m.longitude)]);
            if (latLngs.length > 0) {
                const bounds = L.latLngBounds(latLngs);
                map.fitBounds(bounds, { padding: [50, 50] }); 
            }
        } else {
             map.setView([6.5244, 3.3792], 10);
        }
    }, [markers, map]);

    return null;
};

// Main ShopMap component accepts filters and map height
export default function ShopMap({ filters, mapHeight = '60vh' }) {
    const [rawShops, setRawShops] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching (omitted for brevity) ---
    const fetchShops = async () => {
        setLoading(true);
        try {
            const res = await api.get("/shops/"); 
            let shopData = res.data;
            if (shopData && Array.isArray(shopData.results)) {
                shopData = shopData.results;
            }
            setRawShops(Array.isArray(shopData) ? shopData : []);
        } catch (err) {
            console.error("Failed to fetch shops:", err);
            toast.error("Failed to load map data.");
            setRawShops([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    // --- Filtering Logic (omitted for brevity) ---
    const filteredShops = useMemo(() => {
        let filtered = rawShops;

        // 1. Filter by State
        if (filters.state && filters.state !== 'all') {
            filtered = filtered.filter(shop => shop._state === filters.state || shop.state === filters.state);
        }

        // 2. Filter by Status
        if (filters.status && filters.status !== 'all') {
            const isActive = filters.status === 'true';
            filtered = filtered.filter(shop => shop.is_active === isActive);
        }
        
        // 3. Filter by Date Created
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let cutoffDate;

            if (filters.dateRange === 'last_7d') cutoffDate = subDays(now, 7);
            else if (filters.dateRange === 'last_30d') cutoffDate = subDays(now, 30);
            else if (filters.dateRange === 'last_90d') cutoffDate = subDays(now, 90);
            
            if (cutoffDate) {
                filtered = filtered.filter(shop => new Date(shop.date_created) >= cutoffDate);
            }
        }

        // 4. Filter by Agent
        if (filters.agent && filters.agent !== 'all') {
            filtered = filtered.filter(shop => shop.created_by && shop.created_by.includes(filters.agent));
        }

        // Only return shops with valid latitude/longitude
        return filtered.filter(shop => shop.latitude && shop.longitude);

    }, [filters, rawShops]);

    const defaultPosition = [6.5244, 3.3792]; // Center of Lagos, Nigeria

    if (loading) {
        return (
            <div style={{ height: mapHeight }} className="bg-gray-100 flex items-center justify-center">
                <Zap className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                <p className="text-indigo-500">Loading map data...</p>
            </div>
        );
    }

    return (
        <MapContainer 
            center={defaultPosition} 
            zoom={10} 
            scrollWheelZoom={true} 
            style={{ height: mapHeight, width: '100%' }}
            className="rounded-lg shadow-inner"
        >
            {/* TileLayer: Reverted to standard OpenStreetMap */}
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredShops.map((shop) => (
                <Marker 
                    key={shop.id} 
                    position={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
                    // ⭐ CRITICAL CHANGE: Use the custom icon based on shop status
                    icon={shop.is_active ? ACTIVE_ICON : INACTIVE_ICON}
                >
                    {/* ⭐ Implementation: Tooltip for hover effect */}
                    <Tooltip permanent={false} direction="top" offset={[0, -5]}>
                        <div className="font-semibold text-indigo-600 flex items-center mb-1">
                            <Store className="w-4 h-4 mr-1"/>
                            {shop.name}
                        </div>
                        <p className="text-sm text-gray-700">{shop.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Agent: {shop.created_by || 'Unassigned'}
                        </p>
                        <p className={`text-xs mt-1 font-medium ${shop.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {shop.is_active ? 'Active' : 'Inactive'}
                        </p>
                    </Tooltip>
                </Marker>
            ))}

            <SetBounds markers={filteredShops} />
        </MapContainer>
    );
}

