"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

interface RouteMapProps {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    geometry?: { coordinates?: [number, number][] };
    height?: number;
}

// Custom red marker icon for destination
const redIcon = typeof window !== "undefined" ? new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

// Custom green marker icon for origin
const greenIcon = typeof window !== "undefined" ? new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

function MapInitializer() {
    const map = useMap();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [map]);
    
    return null;
}

export default function RouteMap({ from, to, geometry, height = 320 }: RouteMapProps) {
    const [mounted, setMounted] = useState(false);
    const polyline = useMemo(() => {
        const coords = geometry?.coordinates || [];
        return coords.map(([lng, lat]) => [lat, lng]) as [number, number][];
    }, [geometry]);
    const mapKey = useMemo(
        () => `route-map-${from.lat}-${from.lng}-${to.lat}-${to.lng}-${height}-${polyline.length}`,
        [from.lat, from.lng, to.lat, to.lng, height, polyline.length]
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ height: `${height}px`, width: "100%" }} />;
    }

    return (
        <div style={{ height: `${height}px`, width: "100%" }}>
            <MapContainer
                key={mapKey}
                center={[to.lat, to.lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                className="rounded-2xl"
                zoomControl={true}
            >
                <MapInitializer />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    tileSize={256}
                    updateWhenZooming={false}
                    keepBuffer={2}
                />
                {greenIcon && <Marker position={[from.lat, from.lng]} icon={greenIcon} />}
                {redIcon && <Marker position={[to.lat, to.lng]} icon={redIcon} />}
                {polyline.length > 0 && (
                    <Polyline positions={polyline} pathOptions={{ color: "#8FD1A3", weight: 4 }} />
                )}
            </MapContainer>
        </div>
    );
}
