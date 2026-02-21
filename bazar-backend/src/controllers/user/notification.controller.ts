import { Request, Response } from 'express';
import { NotificationService } from '../../services/user/notification.service';
import { createNotificationDto, markMultipleAsReadDto } from '../../dtos/notification.dto';

const service = new NotificationService();

export class NotificationController {
    /**
     * Get all user notifications
     */
    async getUserNotifications(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;
            const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

            const result = await service.getUserNotifications(userId, page, size, isRead);
            
            return res.status(200).json({
                success: true,
                data: result.notifications,
                pagination: {
                    page,
                    size,
                    total: result.total,
                    totalPages: Math.ceil(result.total / size)
                },
                unreadCount: result.unreadCount,
                message: 'Notifications fetched successfully'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Get a single notification by ID
     */
    async getNotificationById(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { id } = req.params;
            const notification = await service.getNotificationById(id, userId);

            return res.status(200).json({
                success: true,
                data: notification,
                message: 'Notification fetched successfully'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Get unread count
     */
    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const count = await service.getUnreadCount(userId);

            return res.status(200).json({
                success: true,
                data: { unreadCount: count },
                message: 'Unread count fetched successfully'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { id } = req.params;
            const notification = await service.markAsRead(id, userId);

            return res.status(200).json({
                success: true,
                data: notification,
                message: 'Notification marked as read'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Mark multiple notifications as read
     */
    async markMultipleAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const validated = markMultipleAsReadDto.parse(req.body);
            const success = await service.markMultipleAsRead(validated.notificationIds, userId);

            return res.status(200).json({
                success: true,
                data: { updated: success },
                message: 'Notifications marked as read'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const success = await service.markAllAsRead(userId);

            return res.status(200).json({
                success: true,
                data: { updated: success },
                message: 'All notifications marked as read'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { id } = req.params;
            const success = await service.deleteNotification(id, userId);

            return res.status(200).json({
                success: true,
                data: { deleted: success },
                message: 'Notification deleted successfully'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }

    /**
     * Delete all user notifications
     */
    async deleteAllNotifications(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const success = await service.deleteAllUserNotifications(userId);

            return res.status(200).json({
                success: true,
                data: { deleted: success },
                message: 'All notifications deleted successfully'
            });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error'
            });
        }
    }
}
