//API layer for shop operations
//Call api from backend

import axios from './axios';
import { API } from "./endpoints";

export const createShop = async (shopData: any) => {
    try {
        const response = await axios.post(
            API.SHOPS.CREATE_SHOP,
            shopData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to create shop"
        );
    }
}

export const getAllShops = async () => {
    try {
        const response = await axios.get(
            API.SHOPS.GET_ALL_SHOPS
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch shops"
        );
    }
}

export const getPublicShops = async () => {
    try {
        const response = await axios.get(
            API.PUBLIC_SHOPS.GET_FEED
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch public shops"
        );
    }
}

export const getAllAdminShops = async () => {
    try {
        const response = await axios.get(
            API.ADMIN_SHOPS.GET_ALL_SHOPS
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch shops"
        );
    }
}

export const createAdminShop = async (shopData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN_SHOPS.CREATE_SHOP,
            shopData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to create shop"
        );
    }
}

export const getAdminShopById = async (id: string) => {
    try {
        const response = await axios.get(
            API.ADMIN_SHOPS.GET_SHOP_BY_ID(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch shop"
        );
    }
}

export const updateAdminShop = async (id: string, shopData: any) => {
    try {
        const response = await axios.put(
            API.ADMIN_SHOPS.UPDATE_SHOP(id),
            shopData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to update shop"
        );
    }
}

export const deleteAdminShop = async (id: string) => {
    try {
        const response = await axios.delete(
            API.ADMIN_SHOPS.DELETE_SHOP(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to delete shop"
        );
    }
}

export const getMyShop = async () => {
    try {
        const response = await axios.get(
            API.SHOPS.GET_MY_SHOP
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch your shop"
        );
    }
}

export const getShopById = async (id: string) => {
    try {
        const response = await axios.get(
            API.SHOPS.GET_SHOP_BY_ID(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch shop"
        );
    }
}

export const getPublicShopById = async (id: string) => {
    try {
        const response = await axios.get(
            API.PUBLIC_SHOPS.GET_BY_ID(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch public shop"
        );
    }
}

export const getRouteToShop = async (id: string, fromLat: number, fromLng: number) => {
    try {
        const response = await axios.get(
            API.PUBLIC_SHOPS.GET_ROUTE(id),
            { params: { fromLat, fromLng } }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch route"
        );
    }
}

export const updateShop = async (id: string, shopData: any) => {
    try {
        const response = await axios.put(
            API.SHOPS.UPDATE_SHOP(id),
            shopData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to update shop"
        );
    }
}

export const deleteShop = async (id: string) => {
    try {
        const response = await axios.delete(
            API.SHOPS.DELETE_SHOP(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to delete shop"
        );
    }
}