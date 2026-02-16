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

export const getAdminShopReviewsByShopId = async (shopId: string) => {
    try {
        const endpoint = API.ADMIN_SHOP_REVIEWS.GET_BY_SHOP(shopId);
        console.log("🔵 API: Fetching admin reviews from endpoint:", endpoint);
        const response = await axios.get(endpoint);
        console.log("🟢 API: Admin reviews raw response:", response);
        console.log("🟢 API: Admin reviews response.data:", response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error("🔴 API: Admin reviews error:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
        });
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch shop reviews"
        );
    }
};

export const adminDisableShopReview = async (reviewId: string) => {
    try {
        const response = await axios.patch(API.ADMIN_SHOP_REVIEWS.DISABLE(reviewId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to disable review"
        );
    }
};

export const adminDeleteShopReview = async (reviewId: string) => {
    try {
        const response = await axios.delete(API.ADMIN_SHOP_REVIEWS.DELETE(reviewId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete review"
        );
    }
};

export const createShopReview = async (shopId: string, reviewData: any) => {
    try {
        const response = await axios.post(API.SHOP_REVIEWS.CREATE(shopId), reviewData);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to create review"
        );
    }
};

export const updateShopReview = async (shopId: string, reviewId: string, reviewData: any) => {
    try {
        const response = await axios.put(API.SHOP_REVIEWS.UPDATE(shopId, reviewId), reviewData);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to update review"
        );
    }
};

export const deleteShopReview = async (shopId: string, reviewId: string) => {
    try {
        const response = await axios.delete(API.SHOP_REVIEWS.DELETE(shopId, reviewId));
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete review"
        );
    }
};
