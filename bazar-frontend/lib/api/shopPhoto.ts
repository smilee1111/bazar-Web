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

export const createShopPhoto = async (shopId: string, formData: FormData) => {
    try {
        const response = await axios.post(API.SHOP_PHOTOS.CREATE(shopId), formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to upload shop photo"
        );
    }
};

export const deleteShopPhoto = async (shopId: string, photoId: string) => {
    try {
        const response = await axios.delete(API.SHOP_PHOTOS.DELETE(shopId, photoId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete shop photo"
        );
    }
};
