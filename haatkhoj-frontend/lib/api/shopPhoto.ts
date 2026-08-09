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

export const getAdminShopPhotosByShopId = async (shopId: string) => {
    try {
        const endpoint = API.ADMIN_SHOP_PHOTOS.GET_BY_SHOP(shopId);
        console.log("🔵 API: Fetching admin photos from endpoint:", endpoint);
        const response = await axios.get(endpoint);
        console.log("🟢 API: Admin photos raw response:", response);
        console.log("🟢 API: Admin photos response.data:", response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error("🔴 API: Admin photos error:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
        });
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop photos"
        );
    }
};

export const adminDisableShopPhoto = async (photoId: string) => {
    try {
        const response = await axios.patch(API.ADMIN_SHOP_PHOTOS.DISABLE(photoId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to disable photo"
        );
    }
};

export const adminDeleteShopPhoto = async (photoId: string) => {
    try {
        const response = await axios.delete(API.ADMIN_SHOP_PHOTOS.DELETE(photoId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete photo"
        );
    }
};
