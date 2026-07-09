// API configuration
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5050';
// Normalize base URL: remove trailing slash if present
const NORMALIZED_BASE = RAW_BASE.replace(/\/$/, "");

export const API_CONFIG = {
    baseURL: `${NORMALIZED_BASE}/api`,
    BASE_URL: NORMALIZED_BASE,
    // Always return a string for Next/Image `src`. Use a local fallback image when missing.
    getImageUrl: (imagePath: string | undefined | null): string => {
        if (!imagePath) return '/images/logo.svg';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        const baseUrl = NORMALIZED_BASE;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseUrl}${path}`;
    }
};