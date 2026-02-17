"use server";

import { createSavedShop, deleteSavedShop, getSavedShops } from "../api/savedShop";

const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Unexpected error";
};

export const handleGetSavedShops = async () => {
    try {
        const result = await getSavedShops();
        if (result.success) {
            return {
                success: true,
                message: "Saved shops fetched successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to fetch saved shops" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to fetch saved shops" };
    }
};

export const handleSaveShop = async (shopId: string) => {
    try {
        const result = await createSavedShop(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Shop saved successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to save shop" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to save shop" };
    }
};

export const handleRemoveSavedShop = async (shopId: string) => {
    try {
        const result = await deleteSavedShop(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Saved shop removed successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to remove saved shop" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to remove saved shop" };
    }
};
