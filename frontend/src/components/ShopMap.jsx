// src/components/ShopMap.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import { Store, Zap } from 'lucide-react'; 
import api from '../api/api';
import { toast } from 'sonner';
import { subDays } from 'date-fns';
import L from 'leaflet';

// Leaflet icon setup (no changes here)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const createCustomIcon = (color) => L.divIcon({
    className: 'custom-map-pin',
    html: `<svg xmlns="http://www.w.3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3" fill="#FFFFFF" stroke="none"></circle></svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    tooltipAnchor: [0, -20],
});

const ACTIVE_ICON = createCustomIcon('#10B981'); // Green
const INACTIVE_ICON = createCustomIcon('#EF4444'); // Red

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
             map.setView([6.5244, 3.3792], 10); // Default to Lagos
        }
    }, [markers, map]);
    return null;
};

export default function ShopMap({ filters, mapHeight = '60vh' }) {
    const [rawShops, setRawShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        setLoading(true);
        try {
            const res = await api.get("/shops/");
            const shopData = res.data?.results || res.data || [];
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

    // --- UPDATED: Filtering Logic ---
    const filteredShops = useMemo(() => {
        let filtered = rawShops;

        // 1. Filter by Search Term (Matches ShopTable logic)
        if (filters.search) {
            const lowerSearch = filters.search.toLowerCase();
            filtered = filtered.filter(shop => {
                return (
                    shop.name?.toLowerCase().includes(lowerSearch) ||
                    shop.phone_number?.toLowerCase().includes(lowerSearch) ||
                    shop.address?.toLowerCase().includes(lowerSearch) ||
                    shop.state?.toLowerCase().includes(lowerSearch) ||
                    shop.local_government_area?.toLowerCase().includes(lowerSearch) ||
                    // Check owner/agent names (safe string conversion)
                    String(shop.owner || "").toLowerCase().includes(lowerSearch) ||
                    String(shop.created_by || "").toLowerCase().includes(lowerSearch)
                );
            });
        }

        // 2. Filter by State
        if (filters.state && filters.state !== 'all') {
            filtered = filtered.filter(shop => shop.state === filters.state);
        }
        
        // 3. Filter by LGA
        if (filters.lga && filters.lga !== 'all') {
            filtered = filtered.filter(shop => shop.local_government_area === filters.lga);
        }

        // 4. Filter by Status
        if (filters.status && filters.status !== 'all') {
            const isActive = filters.status === 'true';
            filtered = filtered.filter(shop => shop.is_active === isActive);
        }
        
        // 5. Filter by Date Created
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

        // 6. Filter by Agent
        if (filters.agent && filters.agent !== 'all') {
            filtered = filtered.filter(shop => String(shop.created_by_id) === filters.agent);
        }

        // Only return shops with valid coordinates
        return filtered.filter(shop => shop.latitude && shop.longitude);

    }, [filters, rawShops]);

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
            center={[6.5244, 3.3792]} 
            zoom={10} 
            scrollWheelZoom={true} 
            style={{ height: mapHeight, width: '100%' }}
            className="rounded-lg shadow-inner"
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredShops.map((shop) => (
                <Marker 
                    key={shop.id} 
                    position={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
                    icon={shop.is_active ? ACTIVE_ICON : INACTIVE_ICON}
                >
                    <Tooltip permanent={false} direction="top" offset={[0, -5]}>
                        <div className="font-semibold text-indigo-600 flex items-center mb-1">
                            <Store className="w-4 h-4 mr-1"/>{shop.name}
                        </div>
                        <p className="text-sm text-gray-700">{shop.address}</p>
                        <p className="text-xs text-gray-500 mt-1">Agent: {shop.created_by || 'Unassigned'}</p>
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