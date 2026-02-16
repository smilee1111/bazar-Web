"use server";

import { getShopReviewsByShopId, getAdminShopReviewsByShopId, adminDisableShopReview, adminDeleteShopReview } from "../api/shopReview";

export const handleGetShopReviewsByShopId = async (shopId: string) => {
    try {
        const result = await getShopReviewsByShopId(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Shop reviews fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop reviews",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop reviews",
        };
    }
};

export const handleGetAdminShopReviewsByShopId = async (shopId: string) => {
    try {
        console.log("🟠 SERVER ACTION: Calling getAdminShopReviewsByShopId with shopId:", shopId);
        const result = await getAdminShopReviewsByShopId(shopId);
        console.log("🟠 SERVER ACTION: API returned:", result);
        
        // Handle both array and object responses
        if (result?.success !== false && (Array.isArray(result) || result?.data !== undefined)) {
            const data = Array.isArray(result) ? result : result?.data;
            return {
                success: true,
                message: "Shop reviews fetched successfully",
                data: data,
            };
        }
        
        if (result?.success) {
            return {
                success: true,
                message: "Shop reviews fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result?.message || "Failed to fetch shop reviews",
        };
    } catch (err: Error | any) {
        console.error("🟠 SERVER ACTION: Error caught:", err);
        return {
            success: false,
            message: err.message || "Failed to fetch shop reviews",
        };
    }
};

export const handleAdminDisableShopReview = async (reviewId: string) => {
    try {
        const result = await adminDisableShopReview(reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review disabled successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to disable review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to disable review",
        };
    }
};

export const handleAdminDeleteShopReview = async (reviewId: string) => {
    try {
        const result = await adminDeleteShopReview(reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review deleted successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete review",
        };
    }
};
