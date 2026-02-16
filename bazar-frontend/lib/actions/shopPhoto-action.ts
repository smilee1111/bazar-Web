"use server";

import { getShopPhotosByShopId, createShopPhoto, deleteShopPhoto } from "../api/shopPhoto";

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

export const handleCreateShopPhoto = async (shopId: string, formData: FormData) => {
    try {
        const result = await createShopPhoto(shopId, formData);
        if (result.success) {
            return {
                success: true,
                message: "Photo uploaded successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to upload photo",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to upload photo",
        };
    }
};

export const handleDeleteShopPhoto = async (shopId: string, photoId: string) => {
    try {
        const result = await deleteShopPhoto(shopId, photoId);
        if (result.success) {
            return {
                success: true,
                message: "Photo deleted successfully",
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete photo",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete photo",
        };
    }
};
