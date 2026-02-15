"use server";

import { getShopReviewsByShopId } from "../api/shopReview";

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
