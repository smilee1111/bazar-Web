"use server";

import { triggerAggregation, fetchSourceCategories } from "../api/aggregation";

export const handleTriggerAggregation = async (categoryId: string) => {
    try {
        const result = await triggerAggregation(categoryId);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Aggregation completed successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Aggregation failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Aggregation failed"
        };
    }
}

export const handleFetchSourceCategories = async () => {
    try {
        const result = await fetchSourceCategories();
        if (result.success) {
            return {
                success: true,
                message: result.message || "Categories fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch categories"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch categories"
        };
    }
}
