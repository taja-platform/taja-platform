// src/components/ShopMap.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { Store, Zap } from 'lucide-react';
import api from '../api/api';
import { toast } from 'sonner';
import { subDays } from 'date-fns';
import L from 'leaflet';

// --- 1. STATE OF THE ART STYLING ---
// We inject this CSS directly to ensure the clusters look "Super Fat" and "Sleek"
const clusterStyles = `
  .custom-cluster-icon {
    background: transparent;
    border: none;
  }
  .cluster-content {
    width: 45px;
    height: 45px;
    background-color: #4F46E5; /* Indigo-600: Professional & Tech-focused */
    border-radius: 50%;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif; /* Or your system font */
    font-weight: 900; /* SUPER BOLD */
    font-size: 16px; /* BIGGER TEXT */
    border: 3px solid #ffffff; /* Clean White Border */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Soft 3D Shadow */
    transition: transform 0.2s ease;
  }
  /* Hover effect for interactivity */
  .cluster-content:hover {
    transform: scale(1.1);
    background-color: #4338ca;
    cursor: pointer;
  }
`;

// --- CONFIGURATION ---
const NIGERIA_BOUNDS = [
    [4.0, 2.5],   
    [14.0, 15.0]  
];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const createCustomIcon = (color) => L.divIcon({
    className: 'custom-map-pin',
    html: `<svg xmlns="http://www.w.3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.2));"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3" fill="#FFFFFF" stroke="none"></circle></svg>`,
    iconSize: [32, 32], // Made pins slightly bigger too
    iconAnchor: [16, 32],
    tooltipAnchor: [0, -25],
});

const ACTIVE_ICON = createCustomIcon('#10B981'); // Green
const INACTIVE_ICON = createCustomIcon('#EF4444'); // Red

// --- 2. CUSTOM CLUSTER FUNCTION ---
// This function generates the "Super Fat" number bubbles
const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<div class="cluster-content"><span>${cluster.getChildCount()}</span></div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(45, 45, true), // Matches CSS width/height
  });
}

const SetBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const latLngs = markers.map(m => [parseFloat(m.latitude), parseFloat(m.longitude)]);
            if (latLngs.length > 0) {
                const bounds = L.latLngBounds(latLngs);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        } else {
            map.setView([6.5244, 3.3792], 10);
        }
    }, [markers.length, map]);
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

    const filteredShops = useMemo(() => {
        let filtered = rawShops;
        if (filters.search) {
            const lowerSearch = filters.search.toLowerCase();
            filtered = filtered.filter(shop => {
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
        if (filters.state && filters.state !== 'all') filtered = filtered.filter(shop => shop.state === filters.state);
        if (filters.lga && filters.lga !== 'all') filtered = filtered.filter(shop => shop.local_government_area === filters.lga);
        if (filters.status && filters.status !== 'all') {
            const isActive = filters.status === 'true';
            filtered = filtered.filter(shop => shop.is_active === isActive);
        }
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let cutoffDate;
            if (filters.dateRange === 'last_7d') cutoffDate = subDays(now, 7);
            else if (filters.dateRange === 'last_30d') cutoffDate = subDays(now, 30);
            else if (filters.dateRange === 'last_90d') cutoffDate = subDays(now, 90);
            if (cutoffDate) filtered = filtered.filter(shop => new Date(shop.date_created) >= cutoffDate);
        }
        if (filters.agent && filters.agent !== 'all') {
            filtered = filtered.filter(shop => String(shop.created_by_id) === filters.agent);
        }
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
        <>
            {/* Injecting the Custom Styles */}
            <style>{clusterStyles}</style>
            
            <MapContainer
                center={[6.5244, 3.3792]}
                zoom={10}
                scrollWheelZoom={true}
                style={{ height: mapHeight, width: '100%' }}
                className="rounded-lg shadow-inner"
                preferCanvas={true}
                maxBounds={NIGERIA_BOUNDS}
                minZoom={5}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MarkerClusterGroup
                    chunkedLoading={true}
                    // --- 3. APPLY THE CUSTOM ICON FUNCTION HERE ---
                    iconCreateFunction={createClusterCustomIcon} 
                    spiderfyOnMaxZoom={true}
                    // Removing default styles to let our CSS take over completely
                    polygonOptions={{
                        fillColor: '#4F46E5',
                        color: '#4F46E5',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.5
                    }}
                >
                    {filteredShops.map((shop) => (
                        <Marker
                            key={shop.id}
                            position={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
                            icon={shop.is_active ? ACTIVE_ICON : INACTIVE_ICON}
                        >
                            <Tooltip permanent={false} direction="top" offset={[0, -5]}>
                                <div className="font-semibold text-indigo-600 flex items-center mb-1">
                                    <Store className="w-4 h-4 mr-1" />{shop.name}
                                </div>
                                <p className="text-sm text-gray-700">{shop.address}</p>
                                <p className="text-xs text-gray-500 mt-1">Agent: {shop.created_by || 'Unassigned'}</p>
                                <p className={`text-xs mt-1 font-medium ${shop.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                    {shop.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </Tooltip>
                        </Marker>
                    ))}
                </MarkerClusterGroup>

                <SetBounds markers={filteredShops} />
            </MapContainer>
        </>
    );
}