// API configuration
export const API_CONFIG = {
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5050'}/api`,
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5050',
    getImageUrl: (imagePath: string | undefined | null): string | null => {
        if (!imagePath) return null;
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5050';
        return `${baseUrl}${imagePath}`;
    }
};