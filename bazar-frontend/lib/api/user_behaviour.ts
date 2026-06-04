import axios from "./axios";
import { API } from "./endpoints";

const getAxiosMessage = (err: unknown, fallback: string) => {
    const maybe = err as { response?: { data?: { message?: string } }; message?: string };
    return maybe?.response?.data?.message || maybe?.message || fallback;
};

export type UserBehaviourEventType = "view" | "save" | "favorite" | "search_click";

export type UserBehaviourPayload = {
    shopId: string;
    eventType: UserBehaviourEventType;
    timestamp?: string | Date;
    userLocation?: { lat: number; lng: number };
};

export const logUserBehaviour = async (payload: UserBehaviourPayload) => {
    try {
        const response = await axios.post(API.USER_BEHAVIOUR.LOG, payload);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to log user behaviour"));
    }
};