// src/components/ShopMap.jsx
import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Store, Zap } from "lucide-react";
import api from "../api/api";
import { toast } from "sonner";
import { subDays } from "date-fns";
import L from "leaflet";

// Fix for default Leaflet marker icons not showing up in Webpack projects
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Component to dynamically adjust the map view based on filtered markers
const SetBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const latLngs = markers.map((m) => [
        parseFloat(m.latitude),
        parseFloat(m.longitude),
      ]);
      if (latLngs.length > 0) {
        // Creates a bounding box that includes all markers and fits the map view
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      // Default view if no shops are found (e.g., Lagos coordinates)
      map.setView([6.5244, 3.3792], 10);
    }
  }, [markers, map]);

  return null;
};

// Main ShopMap component accepts filters and map height
export default function ShopMap({ filters, mapHeight = "60vh" }) {
  // mapHeight defaults to 60vh
  const [rawShops, setRawShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shops/shops");
      let shopData = res.data;
      if (shopData && Array.isArray(shopData.results)) {
        shopData = shopData.results;
      }
      setRawShops(Array.isArray(shopData) ? shopData : []);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      if (err.response && err.response.status === 401) {
        toast.error("Authentication required for map data.");
      } else {
        toast.error("Failed to load map data.");
      }
      setRawShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // --- Filtering Logic (Uses useMemo for optimization) ---
  const filteredShops = useMemo(() => {
    let filtered = rawShops;

    // 1. Filter by State
    if (filters.state && filters.state !== "all") {
      filtered = filtered.filter(
        (shop) => shop._state === filters.state || shop.state === filters.state
      );
    }

    // 2. Filter by Status
    if (filters.status && filters.status !== "all") {
      const isActive = filters.status === "true";
      filtered = filtered.filter((shop) => shop.is_active === isActive);
    }

    // 3. Filter by Date Created
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate;
      if (filters.dateRange === "last_7d") cutoffDate = subDays(now, 7);
      else if (filters.dateRange === "last_30d") cutoffDate = subDays(now, 30);
      else if (filters.dateRange === "last_90d") cutoffDate = subDays(now, 90);

      if (cutoffDate) {
        filtered = filtered.filter(
          (shop) => new Date(shop.date_created) >= cutoffDate
        );
      }
    }

    // 4. Filter by Agent (Simple string inclusion)
    if (filters.agent && filters.agent !== "all") {
      filtered = filtered.filter(
        (shop) => shop.created_by && shop.created_by.includes(filters.agent)
      );
    }

    // Only return shops with valid latitude/longitude
    return filtered.filter((shop) => shop.latitude && shop.longitude);
  }, [filters, rawShops]);

  // Default map position (Center of Lagos)
  const defaultPosition = [6.5244, 3.3792];

  if (loading) {
    return (
      // The loading state where Zap is used
      <div
        style={{ height: mapHeight }}
        className="bg-gray-100 flex items-center justify-center"
      >
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
      style={{ height: mapHeight, width: "100%" }}
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
        >
          <Popup>
            <div className="font-semibold text-indigo-600 flex items-center mb-1">
              <Store className="w-4 h-4 mr-1" />
              {shop.name}
            </div>
            <p className="text-sm text-gray-700">{shop.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              Agent: {shop.created_by || "Unassigned"}
            </p>
            <p
              className={`text-xs mt-1 font-medium ${
                shop.is_active ? "text-green-600" : "text-red-600"
              }`}
            >
              {shop.is_active ? "Active" : "Inactive"}
            </p>
          </Popup>
        </Marker>
      ))}

      <SetBounds markers={filteredShops} />
    </MapContainer>
  );
}
