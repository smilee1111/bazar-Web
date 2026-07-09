import axios from "./axios";
import { API } from "./endpoints";

const getAxiosMessage = (err: unknown, fallback: string) => {
    const maybe = err as { response?: { data?: { message?: string } }; message?: string };
    return maybe?.response?.data?.message || maybe?.message || fallback;
};

export const getFavourites = async () => {
    try {
        const response = await axios.get(API.USER_FAVOURITES.LIST);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to fetch favourites"));
    }
};

export const createFavourite = async (
    shopId: string,
    userLocation?: { lat: number; lng: number }
) => {
    try {
        const response = await axios.post(API.USER_FAVOURITES.CREATE, {
            shopId,
            userLocation,
        });
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to add favourite"));
    }
};

export const deleteFavourite = async (shopId: string) => {
    try {
        const response = await axios.delete(API.USER_FAVOURITES.DELETE(shopId));
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to remove favourite"));
    }
};
