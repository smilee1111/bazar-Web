"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { searchLocation, reverseGeocode, type GeocodingResult } from "@/lib/services/geocoding.service";

interface LocationPickerProps {
    value?: { lat: number; lng: number };
    onChange?: (location: { lat: number; lng: number; address?: string }) => void;
    height?: number;
    className?: string;
}

// Custom red marker icon for selected location
const redIcon = typeof window !== "undefined" ? new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

// Component to force map initialization and tile loading
function MapInitializer({ onMapReady }: { onMapReady: (map: LeafletMap) => void }) {
    const map = useMap();
    
    useEffect(() => {
        onMapReady(map);
        
        // Force invalidate size to ensure all tiles load
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [map, onMapReady]);
    
    return null;
}

// Map click handler component
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [isGeocoding, setIsGeocoding] = useState(false);

    useMapEvents({
        click: async (e) => {
            if (isGeocoding) return;
            
            const { lat, lng } = e.latlng;
            setIsGeocoding(true);
            
            try {
                onLocationSelect(lat, lng);
            } finally {
                setIsGeocoding(false);
            }
        },
    });
    return null;
}

export default function LocationPicker({ value, onChange, height = 400, className }: LocationPickerProps) {
    const mapRef = useRef<LeafletMap | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchAbortController = useRef<AbortController | null>(null);
    const hasSetInitialLocation = useRef(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
        value || null
    );
    const [address, setAddress] = useState<string>("");
    const [showResults, setShowResults] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Search for locations with debouncing and abort controller
    useEffect(() => {
        // Abort previous search if still running
        if (searchAbortController.current) {
            searchAbortController.current.abort();
        }

        if (searchQuery.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            searchAbortController.current = new AbortController();
            
            try {
                const results = await searchLocation(searchQuery);
                if (!searchAbortController.current.signal.aborted) {
                    setSearchResults(results);
                    setIsSearching(false);
                    setShowResults(true);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Search error:', error);
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => {
            clearTimeout(delayDebounce);
            searchAbortController.current?.abort();
        };
    }, [searchQuery]);

    const handleLocationSelect = async (lat: number, lng: number) => {
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        
        // Pan map to selected location
        if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15, { animate: true });
        }
        
        // Fetch address for the selected location
        try {
            const result = await reverseGeocode(lat, lng);
            const addressText = result?.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(addressText);
            
            if (onChange) {
                onChange({ ...newLocation, address: addressText });
            }
        } catch (error) {
            console.error('Error getting address:', error);
            const addressText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(addressText);
            
            if (onChange) {
                onChange({ ...newLocation, address: addressText });
            }
        }
    };

    const handleSearchResultClick = (result: GeocodingResult) => {
        handleLocationSelect(result.lat, result.lng);
        setSearchQuery(result.displayName);
        setShowResults(false);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
    };

    // Default to Kathmandu, Nepal coordinates
    const position = useMemo<[number, number]>(
        () => [selectedLocation?.lat || 27.7172, selectedLocation?.lng || 85.3240],
        [selectedLocation]
    );

    // Fetch user's current location on mount
    useEffect(() => {
        if (value || hasSetInitialLocation.current) {
            // If value is provided or we already set location, don't fetch
            return;
        }

        if ('geolocation' in navigator) {
            setIsLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    hasSetInitialLocation.current = true;
                    await handleLocationSelect(latitude, longitude);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.log('Geolocation error:', error.message);
                    setIsLoadingLocation(false);
                    // Fallback to Kathmandu if geolocation fails
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }, [value]);

    // Delay map rendering to ensure container is properly sized
    useEffect(() => {
        const timer = setTimeout(() => {
            setMapReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={className}>
            {/* Search Box */}
            <div className="mb-3 relative z-20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f7e4f]" />
                    <Input
                        type="text"
                        placeholder="Search location (e.g., Richmond Town, Bangalore)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 border-[#efe7d6] focus:border-[#c9a86a]"
                    />
                    {searchQuery && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {isSearching && (
                        <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f7e4f] animate-spin" />
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                    <Card className="absolute top-full mt-1 w-full z-50 max-h-60 overflow-y-auto border-[#efe7d6] shadow-lg bg-white">
                        {searchResults.map((result, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearchResultClick(result)}
                                className="w-full text-left px-4 py-3 hover:bg-[#8f7e4f]/5 border-b border-[#efe7d6] last:border-b-0 transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-[#8f7e4f] mt-1 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{result.displayName}</span>
                                </div>
                            </button>
                        ))}
                    </Card>
                )}
            </div>

            {/* Map */}
            <div 
                ref={containerRef}
                className="rounded-2xl overflow-hidden border border-[#efe7d6] relative z-0"
                style={{ height: `${height}px`, width: '100%', minHeight: `${height}px` }}
            >
                {!mapReady ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Loader2 className="h-8 w-8 text-[#8f7e4f] animate-spin" />
                    </div>
                ) : (
                    <MapContainer
                        center={position}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', minHeight: `${height}px` }}
                        zoomControl={true}
                    >
                        <MapInitializer onMapReady={(map) => { 
                            mapRef.current = map;
                            setTimeout(() => map.invalidateSize(), 500);
                        }} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                            tileSize={256}
                            updateWhenZooming={false}
                            keepBuffer={2}
                        />
                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                        {selectedLocation && redIcon && (
                            <Marker 
                                position={[selectedLocation.lat, selectedLocation.lng]} 
                                icon={redIcon}
                            />
                        )}
                    </MapContainer>
                )}
            </div>

            {isLoadingLocation && (
                <p className="text-xs text-[#8f7e4f] mt-2 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Fetching your current location...
                </p>
            )}
            {!isLoadingLocation && (
                <p className="text-xs text-gray-500 mt-2">
                    Click on the map or search for a location to select it
                </p>
            )}
        </div>
    );
}
