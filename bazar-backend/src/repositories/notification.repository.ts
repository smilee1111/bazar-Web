import { INotification, NotificationModel } from "../models/notification.model";

export interface INotificationRepository {
    // Create a notification
    createNotification(data: Partial<INotification>): Promise<INotification>;

    // Get notification by ID
    getNotificationById(id: string): Promise<INotification | null>;

    // Get all notifications for a user
    getUserNotifications(
        userId: string, 
        page: number, 
        size: number, 
        isRead?: boolean
    ): Promise<{ notifications: INotification[], total: number, unreadCount: number }>;

    // Mark notification as read
    markAsRead(id: string): Promise<INotification | null>;

    // Mark multiple notifications as read
    markMultipleAsRead(ids: string[]): Promise<boolean>;

    // Mark all user notifications as read
    markAllAsRead(userId: string): Promise<boolean>;

    // Delete a notification
    deleteNotification(id: string): Promise<boolean>;

    // Delete all user notifications
    deleteAllUserNotifications(userId: string): Promise<boolean>;

    // Get unread count for a user
    getUnreadCount(userId: string): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
    
    async createNotification(data: Partial<INotification>): Promise<INotification> {
        const notification = new NotificationModel(data);
        return await notification.save();
    }

    async getNotificationById(id: string): Promise<INotification | null> {
        return await NotificationModel.findById(id)
            .populate({ path: 'userId', select: 'fullName username email profilePic' });
    }

    async getUserNotifications(
        userId: string, 
        page: number, 
        size: number, 
        isRead?: boolean
    ): Promise<{ notifications: INotification[], total: number, unreadCount: number }> {
        const filter: any = { userId };
        
        if (isRead !== undefined) {
            filter.isRead = isRead;
        }

        const skip = (page - 1) * size;

        const [notifications, total, unreadCount] = await Promise.all([
            NotificationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(size)
                .populate({ path: 'userId', select: 'fullName username email profilePic' }),
            NotificationModel.countDocuments(filter),
            NotificationModel.countDocuments({ userId, isRead: false })
        ]);

        return { notifications, total, unreadCount };
    }

    async markAsRead(id: string): Promise<INotification | null> {
        return await NotificationModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        ).populate({ path: 'userId', select: 'fullName username email profilePic' });
    }

    async markMultipleAsRead(ids: string[]): Promise<boolean> {
        const result = await NotificationModel.updateMany(
            { _id: { $in: ids } },
            { isRead: true }
        );
        return result.modifiedCount > 0;
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const result = await NotificationModel.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return result.modifiedCount >= 0;
    }

    async deleteNotification(id: string): Promise<boolean> {
        const result = await NotificationModel.findByIdAndDelete(id);
        return result !== null;
    }

    async deleteAllUserNotifications(userId: string): Promise<boolean> {
        const result = await NotificationModel.deleteMany({ userId });
        return result.deletedCount >= 0;
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await NotificationModel.countDocuments({ userId, isRead: false });
    }
}
