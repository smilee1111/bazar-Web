"use server";

import { getDatasetOverview, getInteractionOverview } from "../api/eda";

export const handleGetDatasetOverview = async () => {
    try {
        const result = await getDatasetOverview();
        if (result.success) {
            return {
                success: true,
                message: result.message || "Fetched dataset overview",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch dataset overview"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch dataset overview"
        };
    }
}

export const handleGetInteractionOverview = async () => {
    try {
        const result = await getInteractionOverview();
        if (result.success) {
            return {
                success: true,
                message: result.message || "Fetched interaction overview",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch interaction overview"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch interaction overview"
        };
    }
}
