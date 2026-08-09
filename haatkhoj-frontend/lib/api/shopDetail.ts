// API layer for shop details

import axios from "./axios";
import { API } from "./endpoints";

export interface ShopDetailData {
    link1?: string;
    link2?: string;
    link3?: string;
    link4?: string;
}

export const getShopDetailByShopId = async (shopId: string) => {
    try {
        const response = await axios.get(API.SHOP_DETAILS.GET_BY_SHOP(shopId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop details"
        );
    }
};

export const createShopDetail = async (shopId: string, data: ShopDetailData) => {
    try {
        const response = await axios.post(API.SHOP_DETAILS.CREATE(shopId), data);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to create shop details"
        );
    }
};

export const updateShopDetail = async (shopId: string, detailId: string, data: ShopDetailData) => {
    try {
        const response = await axios.put(API.SHOP_DETAILS.UPDATE(shopId, detailId), data);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to update shop details"
        );
    }
};

export const deleteShopDetail = async (shopId: string, detailId: string) => {
    try {
        const response = await axios.delete(API.SHOP_DETAILS.DELETE(shopId, detailId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete shop details"
        );
    }
};

export const getAdminAllShopDetails = async () => {
    try {
        const endpoint = API.ADMIN_SHOP_DETAILS.GET_ALL;
        console.log("🔵 API: Fetching admin details from endpoint:", endpoint);
        const response = await axios.get(endpoint);
        console.log("🟢 API: Admin details raw response:", response);
        console.log("🟢 API: Admin details response.data:", response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error("🔴 API: Admin details error:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
        });
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop details"
        );
    }
};

export const getAdminShopDetailById = async (detailId: string) => {
    try {
        const response = await axios.get(API.ADMIN_SHOP_DETAILS.GET_BY_ID(detailId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop detail"
        );
    }
};

export const adminDeleteShopDetail = async (detailId: string) => {
    try {
        const response = await axios.delete(API.ADMIN_SHOP_DETAILS.DELETE(detailId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete shop details"
        );
    }
};
