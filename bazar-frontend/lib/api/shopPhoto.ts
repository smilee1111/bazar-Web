// API layer for shop photos

import axios from "./axios";
import { API } from "./endpoints";

export const getShopPhotosByShopId = async (shopId: string) => {
    try {
        const response = await axios.get(API.SHOP_PHOTOS.GET_BY_SHOP(shopId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop photos"
        );
    }
};
