"use server";

import { getShopPhotosByShopId } from "../api/shopPhoto";

export const handleGetShopPhotosByShopId = async (shopId: string) => {
    try {
        const result = await getShopPhotosByShopId(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Shop photos fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop photos",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop photos",
        };
    }
};
