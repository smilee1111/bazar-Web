"use server";

import { getShopDetailByShopId, createShopDetail, updateShopDetail, deleteShopDetail, ShopDetailData } from "../api/shopDetail";

export const handleGetShopDetailByShopId = async (shopId: string) => {
    try {
        const result = await getShopDetailByShopId(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Shop details fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop details",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop details",
        };
    }
};

export const handleCreateShopDetail = async (shopId: string, data: ShopDetailData) => {
    try {
        const result = await createShopDetail(shopId, data);
        if (result.success) {
            return {
                success: true,
                message: "Shop details created successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create shop details",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to create shop details",
        };
    }
};

export const handleUpdateShopDetail = async (shopId: string, detailId: string, data: ShopDetailData) => {
    try {
        const result = await updateShopDetail(shopId, detailId, data);
        if (result.success) {
            return {
                success: true,
                message: "Shop details updated successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update shop details",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update shop details",
        };
    }
};

export const handleDeleteShopDetail = async (shopId: string, detailId: string) => {
    try {
        const result = await deleteShopDetail(shopId, detailId);
        if (result.success) {
            return {
                success: true,
                message: "Shop details deleted successfully",
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete shop details",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete shop details",
        };
    }
};
