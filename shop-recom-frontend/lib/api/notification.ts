import axios from "./axios";
import { API } from "./endpoints";
import type {
    NotificationResponse,
    SingleNotificationResponse,
    UnreadCountResponse,
    MarkAsReadResponse,
    DeleteNotificationResponse
} from "../types/notification";

const getAxiosMessage = (err: unknown, fallback: string) => {
    const maybe = err as { response?: { data?: { message?: string } }; message?: string };
    return maybe?.response?.data?.message || maybe?.message || fallback;
};

/**
 * Get all user notifications with pagination and filters
 */
export const getNotifications = async (
    page: number = 1,
    size: number = 20,
    isRead?: boolean
): Promise<NotificationResponse> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (isRead !== undefined) {
            params.append('isRead', isRead.toString());
        }
        
        const response = await axios.get(`${API.USER_NOTIFICATIONS.LIST}?${params.toString()}`);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to fetch notifications"));
    }
};

/**
 * Get a single notification by ID
 */
export const getNotificationById = async (id: string): Promise<SingleNotificationResponse> => {
    try {
        const response = await axios.get(API.USER_NOTIFICATIONS.GET_BY_ID(id));
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to fetch notification"));
    }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
    try {
        const response = await axios.get(API.USER_NOTIFICATIONS.UNREAD_COUNT);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to fetch unread count"));
    }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<MarkAsReadResponse> => {
    try {
        const response = await axios.patch(API.USER_NOTIFICATIONS.MARK_AS_READ(id));
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to mark notification as read"));
    }
};

/**
 * Mark multiple notifications as read
 */
export const markMultipleAsRead = async (notificationIds: string[]): Promise<MarkAsReadResponse> => {
    try {
        const response = await axios.patch(API.USER_NOTIFICATIONS.MARK_MULTIPLE_READ, {
            notificationIds
        });
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to mark notifications as read"));
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<MarkAsReadResponse> => {
    try {
        const response = await axios.patch(API.USER_NOTIFICATIONS.MARK_ALL_READ);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to mark all notifications as read"));
    }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<DeleteNotificationResponse> => {
    try {
        const response = await axios.delete(API.USER_NOTIFICATIONS.DELETE(id));
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to delete notification"));
    }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<DeleteNotificationResponse> => {
    try {
        const response = await axios.delete(API.USER_NOTIFICATIONS.DELETE_ALL);
        return response.data;
    } catch (err: unknown) {
        throw new Error(getAxiosMessage(err, "Failed to delete all notifications"));
    }
};
