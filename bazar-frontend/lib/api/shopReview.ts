// API layer for shop reviews

import axios from "./axios";
import { API } from "./endpoints";

export const getShopReviewsByShopId = async (shopId: string) => {
    try {
        const response = await axios.get(API.SHOP_REVIEWS.GET_BY_SHOP(shopId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop reviews"
        );
    }
};
