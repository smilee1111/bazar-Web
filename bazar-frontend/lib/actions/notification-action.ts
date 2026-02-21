"use server";

import {
    getNotifications,
    getNotificationById,
    getUnreadCount,
    markNotificationAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from "../api/notification";

const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Unexpected error";
};

/**
 * Fetch user notifications with pagination and filters
 */
export const handleGetNotifications = async (
    page: number = 1,
    size: number = 20,
    isRead?: boolean
) => {
    try {
        const result = await getNotifications(page, size, isRead);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Notifications fetched successfully",
                data: result.data,
                pagination: result.pagination,
                unreadCount: result.unreadCount
            };
        }
        return { success: false, message: result.message || "Failed to fetch notifications" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};

/**
 * Fetch a single notification by ID
 */
export const handleGetNotificationById = async (id: string) => {
    try {
        const result = await getNotificationById(id);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Notification fetched successfully",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to fetch notification" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};

/**
 * Get unread notification count
 */
export const handleGetUnreadCount = async () => {
    try {
        const result = await getUnreadCount();
        if (result.success) {
            return {
                success: true,
                message: result.message || "Unread count fetched successfully",
                unreadCount: result.data.unreadCount
            };
        }
        return { success: false, message: result.message || "Failed to fetch unread count", unreadCount: 0 };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err), unreadCount: 0 };
    }
};

/**
 * Mark a single notification as read
 */
export const handleMarkNotificationAsRead = async (id: string) => {
    try {
        const result = await markNotificationAsRead(id);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Notification marked as read",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to mark notification as read" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};

/**
 * Mark multiple notifications as read
 */
export const handleMarkMultipleAsRead = async (notificationIds: string[]) => {
    try {
        const result = await markMultipleAsRead(notificationIds);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Notifications marked as read",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to mark notifications as read" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};

/**
 * Mark all notifications as read
 */
export const handleMarkAllAsRead = async () => {
    try {
        const result = await markAllAsRead();
        if (result.success) {
            return {
                success: true,
                message: result.message || "All notifications marked as read",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to mark all notifications as read" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};

/**
 * Delete a notification
 */
export const handleDeleteNotification = async (id: string) => {
    try {
        const result = await deleteNotification(id);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Notification deleted successfully",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to delete notification" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};

/**
 * Delete all notifications
 */
export const handleDeleteAllNotifications = async () => {
    try {
        const result = await deleteAllNotifications();
        if (result.success) {
            return {
                success: true,
                message: result.message || "All notifications deleted successfully",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to delete all notifications" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
};
