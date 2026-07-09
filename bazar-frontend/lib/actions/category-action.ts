"use server";

import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../api/category";
import { revalidatePath } from "next/cache";

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

export const handleCreateCategory = async (data: any) => {
    try {
        const result = await createCategory(data);
        if (result.success) {
            revalidatePath("/admin/categories");
            return { success: true, message: "Category created successfully", data: result.data };
        }
        return { success: false, message: result.message || "Failed to create category" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to create category" };
    }
};

export const handleUpdateCategory = async (id: string, data: any) => {
    try {
        const result = await updateCategory(id, data);
        if (result.success) {
            revalidatePath("/admin/categories");
            return { success: true, message: "Category updated successfully", data: result.data };
        }
        return { success: false, message: result.message || "Failed to update category" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to update category" };
    }
};

export const handleDeleteCategory = async (id: string) => {
    try {
        const result = await deleteCategory(id);
        if (result.success) {
            revalidatePath("/admin/categories");
            return { success: true, message: "Category deleted successfully" };
        }
        return { success: false, message: result.message || "Failed to delete category" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to delete category" };
    }
};
