import axios from "./axios";
import { API } from "./endpoints";

const getAxiosMessage = (err: unknown, fallback: string) => {
    const maybe = err as { response?: { data?: { message?: string } }; message?: string };
    return maybe?.response?.data?.message || maybe?.message || fallback;
};

export const getSavedShops = async () => {
    try {
        const response = await axios.get(API.USER_SAVED_SHOPS.LIST);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to fetch saved shops"));
    }
};

export const createSavedShop = async (
    shopId: string,
    userLocation?: { lat: number; lng: number }
) => {
    try {
        const response = await axios.post(API.USER_SAVED_SHOPS.CREATE, {
            shopId,
            userLocation,
        });
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to save shop"));
    }
};

export const deleteSavedShop = async (shopId: string) => {
    try {
        const response = await axios.delete(API.USER_SAVED_SHOPS.DELETE(shopId));
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to remove saved shop"));
    }
};
