export type UserLocation = { lat: number; lng: number };

const STORAGE_KEY = "haatkhoj_user_location";

const isValidLocation = (value: any): value is UserLocation => {
    return (
        value &&
        typeof value.lat === "number" &&
        typeof value.lng === "number" &&
        Number.isFinite(value.lat) &&
        Number.isFinite(value.lng)
    );
};

export const getCachedUserLocation = (): UserLocation | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return isValidLocation(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

export const cacheUserLocation = (location: UserLocation) => {
    if (typeof window === "undefined") return;
    if (!isValidLocation(location)) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {
        // Ignore storage errors (private mode, quota, etc.)
    }
};
