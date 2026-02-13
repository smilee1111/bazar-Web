"use server";

import { getAllCategories } from "../api/category";

export const handleGetAllCategories = async () => {
    try {
        const result = await getAllCategories();
        if (result.success) {
            return {
                success: true,
                message: "Categories fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch categories",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch categories",
        };
    }
};
