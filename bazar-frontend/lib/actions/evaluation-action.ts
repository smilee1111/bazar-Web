"use server";

import { getEvaluationStats } from "../api/evaluation";

export const handleGetEvaluationStats = async (lat: number = 27.7, lng: number = 85.32) => {
    try {
        const result = await getEvaluationStats(lat, lng);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Fetched evaluation stats",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch evaluation stats"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch evaluation stats"
        };
    }
}
