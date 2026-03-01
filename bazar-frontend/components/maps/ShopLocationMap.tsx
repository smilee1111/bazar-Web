"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

interface ShopLocationMapProps {
    lat: number;
    lng: number;
    height?: number;
    className?: string;
}

// Custom red marker icon for shop location
const redIcon = typeof window !== "undefined" ? new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
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

export default function ShopLocationMap({ lat, lng, height = 280, className }: ShopLocationMapProps) {
    const [mounted, setMounted] = useState(false);
    const position = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);
    const mapKey = useMemo(() => `shop-map-${lat}-${lng}-${height}`, [lat, lng, height]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className={className} style={{ height: `${height}px`, width: "100%" }} />;
    }

    return (
        <div className={className} style={{ height: `${height}px`, width: "100%" }}>
            <MapContainer
                key={mapKey}
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                className="rounded-2xl border border-[#F5EFE7]"
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
                {redIcon && <Marker position={position} icon={redIcon} />}
            </MapContainer>
        </div>
    );
}
