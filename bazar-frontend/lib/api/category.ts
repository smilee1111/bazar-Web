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
