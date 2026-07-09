"use server";

import { getRecommendations } from "../api/recommendation";

export const handleGetRecommendations = async (lat: number, lng: number) => {
    try {
        const result = await getRecommendations(lat, lng);
        if (result.success) {
            // Debug log to see if backend sent photos
            if (result.data && result.data.length > 0) {
                console.log("Frontend Action received shop photos:", JSON.stringify(result.data[0].shop?.photos, null, 2));
            }
            return {
                success: true,
                message: result.message || "Fetched recommendations",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch recommendations"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch recommendations"
        };
    }
}
