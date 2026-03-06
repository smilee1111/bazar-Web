/**
 * Geocoding Service - Free location search using OpenStreetMap Nominatim
 * Following clean architecture principles
 */

// User-Agent is REQUIRED by Nominatim API to prevent rate limiting
const NOMINATIM_HEADERS = {
    'User-Agent': 'BazarApp/1.0',
};

export interface GeocodingResult {
    address: string;
    lat: number;
    lng: number;
    displayName: string;
}

export interface ReverseGeocodingResult {
    address: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    road?: string;
}

/**
 * Search for locations by address
 * @param query - Address search query
 * @returns Array of matching locations
 */
export async function searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 3) {
        return [];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
                q: query,
                format: 'json',
                limit: '5',
                addressdetails: '1',
            }),
            {
                headers: NOMINATIM_HEADERS,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch location');
        }

        const data = await response.json();
        
        return data.map((item: any) => ({
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
        }));
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
}

/**
 * Get address from coordinates (reverse geocoding)
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Address details
 */
export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<ReverseGeocodingResult | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
                lat: lat.toString(),
                lon: lng.toString(),
                format: 'json',
                addressdetails: '1',
            }),
            {
                headers: NOMINATIM_HEADERS,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to reverse geocode');
        }

        const data = await response.json();
        
        return {
            address: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village,
            state: data.address?.state,
            country: data.address?.country,
            postcode: data.address?.postcode,
            road: data.address?.road,
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
