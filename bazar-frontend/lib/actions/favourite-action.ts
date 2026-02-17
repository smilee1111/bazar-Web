"use server";

import { createFavourite, deleteFavourite, getFavourites } from "../api/favourite";

const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Unexpected error";
};

export const handleGetFavourites = async () => {
    try {
        const result = await getFavourites();
        if (result.success) {
            return {
                success: true,
                message: "Favourites fetched successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to fetch favourites" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to fetch favourites" };
    }
};

export const handleAddFavourite = async (shopId: string) => {
    try {
        const result = await createFavourite(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Favourite added successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to add favourite" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to add favourite" };
    }
};

export const handleRemoveFavourite = async (shopId: string) => {
    try {
        const result = await deleteFavourite(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Favourite removed successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to remove favourite" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to remove favourite" };
    }
};
