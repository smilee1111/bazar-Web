import axios from './axios';
import { API } from "./endpoints";

export const triggerAggregation = async (categoryId: string) => {
    try {
        const response = await axios.post(API.ADMIN_AGGREGATION.TRIGGER, { categoryId });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to trigger aggregation"
        );
    }
}

export const fetchSourceCategories = async () => {
    try {
        const response = await axios.get(API.ADMIN_AGGREGATION.SOURCE_CATEGORIES);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch source categories"
        );
    }
}
