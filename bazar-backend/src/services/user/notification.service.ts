import { NotificationRepository } from "../../repositories/notification.repository";
import { CreateNotificationDto, UpdateNotificationDto } from "../../dtos/notification.dto";
import { HttpError } from "../../errors/http-error";

const notificationRepository = new NotificationRepository();

export class NotificationService {
    /**
     * Create a new notification
     */
    async createNotification(data: CreateNotificationDto) {
        return await notificationRepository.createNotification(data);
    }

    /**
     * Get all user notifications with pagination and filter
     */
    async getUserNotifications(userId: string, page: number = 1, size: number = 20, isRead?: boolean) {
        return await notificationRepository.getUserNotifications(userId, page, size, isRead);
    }

    /**
     * Get a single notification by ID
     */
    async getNotificationById(id: string, userId: string) {
        const notification = await notificationRepository.getNotificationById(id);
        
        if (!notification) {
            throw new HttpError(404, "Notification not found");
        }

        // Ensure user can only access their own notifications
        const notificationUserId = typeof notification.userId === 'object' && notification.userId?._id
            ? notification.userId._id.toString()
            : notification.userId?.toString();

        if (notificationUserId !== userId.toString()) {
            throw new HttpError(403, "Not authorized to access this notification");
        }

        return notification;
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string, userId: string) {
        const notification = await notificationRepository.getNotificationById(id);
        
        if (!notification) {
            throw new HttpError(404, "Notification not found");
        }

        // Ensure user can only mark their own notifications as read
        const notificationUserId = typeof notification.userId === 'object' && notification.userId?._id
            ? notification.userId._id.toString()
            : notification.userId?.toString();

        if (notificationUserId !== userId.toString()) {
            throw new HttpError(403, "Not authorized to update this notification");
        }

        return await notificationRepository.markAsRead(id);
    }

    /**
     * Mark multiple notifications as read
     */
    async markMultipleAsRead(ids: string[], userId: string) {
        // Verify all notifications belong to the user
        for (const id of ids) {
            const notification = await notificationRepository.getNotificationById(id);
            if (notification) {
                const notificationUserId = typeof notification.userId === 'object' && notification.userId?._id
                    ? notification.userId._id.toString()
                    : notification.userId?.toString();

                if (notificationUserId !== userId.toString()) {
                    throw new HttpError(403, "Not authorized to update one or more notifications");
                }
            }
        }

        return await notificationRepository.markMultipleAsRead(ids);
    }

    /**
     * Mark all user notifications as read
     */
    async markAllAsRead(userId: string) {
        return await notificationRepository.markAllAsRead(userId);
    }

    /**
     * Delete a notification
     */
    async deleteNotification(id: string, userId: string) {
        const notification = await notificationRepository.getNotificationById(id);
        
        if (!notification) {
            throw new HttpError(404, "Notification not found");
        }

        // Ensure user can only delete their own notifications
        const notificationUserId = typeof notification.userId === 'object' && notification.userId?._id
            ? notification.userId._id.toString()
            : notification.userId?.toString();

        if (notificationUserId !== userId.toString()) {
            throw new HttpError(403, "Not authorized to delete this notification");
        }

        return await notificationRepository.deleteNotification(id);
    }

    /**
     * Delete all user notifications
     */
    async deleteAllUserNotifications(userId: string) {
        return await notificationRepository.deleteAllUserNotifications(userId);
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string) {
        return await notificationRepository.getUnreadCount(userId);
    }
}
