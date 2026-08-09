export interface CityPoint {
    name: string;
    lng: number;
    lat: number;
    aliases?: string[];
}

// Shared by crawlers that lack per-listing geo data (jitter around a nearest city center) and by
// EDA (bucket a shop's coordinates into a human-readable city for descriptive stats).
export const NEPAL_CITIES: CityPoint[] = [
    { name: "Kathmandu", lng: 85.3240, lat: 27.7172 },
    { name: "Lalitpur", lng: 85.3206, lat: 27.6644, aliases: ["patan"] },
    { name: "Bhaktapur", lng: 85.4298, lat: 27.6710 },
    { name: "Pokhara", lng: 83.9856, lat: 28.2096, aliases: ["kaski"] },
    { name: "Biratnagar", lng: 87.2718, lat: 26.4525 },
    { name: "Chitwan", lng: 84.5556, lat: 27.5291 },
    { name: "Butwal", lng: 83.4470, lat: 27.7000 },
    { name: "Dharan", lng: 87.2835, lat: 26.8065 },
    { name: "Nepalgunj", lng: 81.6168, lat: 28.0500 }
];

export function resolveCityCoords(label: string): [number, number] {
    const lower = label.toLowerCase();
    const match = NEPAL_CITIES.find(
        c => lower.includes(c.name.toLowerCase()) || (c.aliases || []).some(a => lower.includes(a))
    );
    const city = match || NEPAL_CITIES[0];
    return [city.lng, city.lat];
}

function haversineKm(lng1: number, lat1: number, lng2: number, lat2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestCity(lng: number, lat: number): string {
    let best = NEPAL_CITIES[0];
    let bestDist = Infinity;
    for (const city of NEPAL_CITIES) {
        const dist = haversineKm(lng, lat, city.lng, city.lat);
        if (dist < bestDist) {
            bestDist = dist;
            best = city;
        }
    }
    return best.name;
}
