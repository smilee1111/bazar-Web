import axios from './axios';
import { API } from "./endpoints";

export const getDatasetOverview = async () => {
    try {
        const response = await axios.get(API.ADMIN_EDA.DATASET);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch dataset overview"
        );
    }
}

export const getInteractionOverview = async () => {
    try {
        const response = await axios.get(API.ADMIN_EDA.INTERACTIONS);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch interaction overview"
        );
    }
}
