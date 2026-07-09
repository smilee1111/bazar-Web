import axios from './axios';
import { API } from "./endpoints";

export const getEvaluationStats = async (lat: number = 27.7, lng: number = 85.32) => {
    try {
        const response = await axios.get(`${API.ADMIN_EVALUATION}?lat=${lat}&lng=${lng}`);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch evaluation stats"
        );
    }
}
