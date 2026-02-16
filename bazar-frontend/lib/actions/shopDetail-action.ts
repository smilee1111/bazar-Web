"use server";

import { getShopDetailByShopId, createShopDetail, updateShopDetail, deleteShopDetail, ShopDetailData, getAdminAllShopDetails, getAdminShopDetailById, adminDeleteShopDetail } from "../api/shopDetail";

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

export const handleGetAdminAllShopDetails = async () => {
    try {
        console.log("🟠 SERVER ACTION: Calling getAdminAllShopDetails");
        const result = await getAdminAllShopDetails();
        console.log("🟠 SERVER ACTION: API returned:", result);
        
        if (result?.success !== false && (Array.isArray(result) || result?.data !== undefined)) {
            const data = Array.isArray(result) ? result : result?.data;
            return {
                success: true,
                message: "Shop details fetched successfully",
                data: data,
            };
        }
        
        if (result?.success) {
            return {
                success: true,
                message: "Shop details fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result?.message || "Failed to fetch shop details",
        };
    } catch (err: Error | any) {
        console.error("🟠 SERVER ACTION: Error caught:", err);
        return {
            success: false,
            message: err.message || "Failed to fetch shop details",
        };
    }
};

export const handleGetAdminShopDetailById = async (detailId: string) => {
    try {
        const result = await getAdminShopDetailById(detailId);
        if (result.success) {
            return {
                success: true,
                message: "Shop detail fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop detail",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop detail",
        };
    }
};

export const handleAdminDeleteShopDetail = async (detailId: string) => {
    try {
        const result = await adminDeleteShopDetail(detailId);
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
