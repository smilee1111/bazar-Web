"use server";

import { getShopPhotosByShopId, createShopPhoto, deleteShopPhoto, getAdminShopPhotosByShopId, adminDisableShopPhoto, adminDeleteShopPhoto } from "../api/shopPhoto";

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

export const handleGetAdminShopPhotosByShopId = async (shopId: string) => {
    try {
        console.log("🟠 SERVER ACTION: Calling getAdminShopPhotosByShopId with shopId:", shopId);
        const result = await getAdminShopPhotosByShopId(shopId);
        console.log("🟠 SERVER ACTION: API returned:", result);
        
        if (result?.success !== false && (Array.isArray(result) || result?.data !== undefined)) {
            const data = Array.isArray(result) ? result : result?.data;
            return {
                success: true,
                message: "Shop photos fetched successfully",
                data: data,
            };
        }
        
        if (result?.success) {
            return {
                success: true,
                message: "Shop photos fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result?.message || "Failed to fetch shop photos",
        };
    } catch (err: Error | any) {
        console.error("🟠 SERVER ACTION: Error caught:", err);
        return {
            success: false,
            message: err.message || "Failed to fetch shop photos",
        };
    }
};

export const handleAdminDisableShopPhoto = async (photoId: string) => {
    try {
        const result = await adminDisableShopPhoto(photoId);
        if (result.success) {
            return {
                success: true,
                message: "Photo disabled successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to disable photo",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to disable photo",
        };
    }
};

export const handleAdminDeleteShopPhoto = async (photoId: string) => {
    try {
        const result = await adminDeleteShopPhoto(photoId);
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
