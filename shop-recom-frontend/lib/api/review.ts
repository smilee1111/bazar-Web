import axios from "./axios";
import { API } from "./endpoints";

const getAxiosMessage = (err: unknown, fallback: string) => {
    const maybe = err as { response?: { data?: { message?: string } }; message?: string };
    return maybe?.response?.data?.message || maybe?.message || fallback;
};

export const getUserReviews = async () => {
    try {
        const response = await axios.get(API.USER_REVIEWS.LIST);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to fetch reviews"));
    }
};
