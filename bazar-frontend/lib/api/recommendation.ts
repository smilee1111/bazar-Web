import axios from './axios';
import { API } from "./endpoints";

export const getRecommendations = async (lat: number, lng: number) => {
    try {
        const response = await axios.get(
            `${API.RECOMMENDATIONS}?lat=${lat}&lng=${lng}&_t=${Date.now()}`
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch recommendations"
        );
    }
}
