// API layer for category operations

import axios from "./axios";
import { API } from "./endpoints";

export const getAllCategories = async () => {
    try {
        const response = await axios.get(API.CATEGORIES.GET_ALL);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch categories"
        );
    }
};

export const createCategory = async (data: any) => {
    try {
        const response = await axios.post(API.ADMIN_CATEGORIES.CREATE, data);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(err.response?.data?.message || err.message || "Failed to create category");
    }
};

export const updateCategory = async (id: string, data: any) => {
    try {
        const response = await axios.put(API.ADMIN_CATEGORIES.UPDATE(id), data);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(err.response?.data?.message || err.message || "Failed to update category");
    }
};

export const deleteCategory = async (id: string) => {
    try {
        const response = await axios.delete(API.ADMIN_CATEGORIES.DELETE(id));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(err.response?.data?.message || err.message || "Failed to delete category");
    }
};
