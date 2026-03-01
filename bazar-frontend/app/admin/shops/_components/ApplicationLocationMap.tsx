"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { searchLocation } from "@/lib/services/geocoding.service";

const ShopLocationMap = dynamic(() => import("@/components/maps/ShopLocationMap"), { ssr: false });

interface PointLocation {
    type: "Point";
    coordinates: [number, number];
}

interface ApplicationLocationMapProps {
    location?: PointLocation;
    businessAddress?: string;
    height?: number;
}

function getValidCoords(location?: PointLocation): { lat: number; lng: number } | null {
    if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return null;
    }
    const [lng, lat] = location.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }
    return { lat, lng };
}

export default function ApplicationLocationMap({
    location,
    businessAddress,
    height = 220,
}: ApplicationLocationMapProps) {
    const coordsFromPayload = useMemo(() => getValidCoords(location), [location]);
    const [fallbackCoords, setFallbackCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (coordsFromPayload) {
            setFallbackCoords(null);
            return;
        }

        if (!businessAddress || businessAddress.trim().length < 3) {
            setFallbackCoords(null);
            return;
        }

        setLoading(true);
        searchLocation(businessAddress)
            .then((results) => {
                if (cancelled) return;
                const first = results[0];
                if (first && Number.isFinite(first.lat) && Number.isFinite(first.lng)) {
                    setFallbackCoords({ lat: first.lat, lng: first.lng });
                } else {
                    setFallbackCoords(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [coordsFromPayload, businessAddress]);

    const coords = coordsFromPayload || fallbackCoords;

    return (
        <div>
            <Label className="text-sm font-medium">Business Location</Label>
            <div className="mt-2 overflow-hidden rounded-2xl">
                {coords ? (
                    <ShopLocationMap lat={coords.lat} lng={coords.lng} height={height} />
                ) : (
                    <div className="rounded-2xl border border-[#F5EFE7] bg-[#FAF4EC] px-4 py-3 text-sm text-gray-600">
                        {loading ? "Loading map..." : "Location not available for this application."}
                    </div>
                )}
            </div>
        </div>
    );
}
