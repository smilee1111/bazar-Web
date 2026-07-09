// Notification types matching backend
export type NotificationType = 
    | 'review_like'          // Someone liked your review
    | 'review_dislike'       // Someone disliked your review
    | 'new_shop'             // New shop added (for all users)
    | 'shop_reviewed'        // Your shop received a review (for sellers)
    | 'seller_application'   // New seller application (for admins)
    | 'general';             // General notifications

export type RelatedEntityType = 'shop' | 'review' | 'user';

export interface Notification {
    _id: string;
    notificationId?: string;
    userId: string | {
        _id: string;
        fullName: string;
        username: string;
        email: string;
        profilePic?: string;
    };
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: RelatedEntityType;
    isRead: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data: Notification[];
    pagination?: {
        page: number;
        size: number;
        total: number;
        totalPages: number;
    };
    unreadCount?: number;
}

export interface SingleNotificationResponse {
    success: boolean;
    message: string;
    data: Notification;
}

export interface UnreadCountResponse {
    success: boolean;
    message: string;
    data: {
        unreadCount: number;
    };
}

export interface MarkAsReadResponse {
    success: boolean;
    message: string;
    data: {
        updated: boolean;
    } | Notification;
}

export interface DeleteNotificationResponse {
    success: boolean;
    message: string;
    data: {
        deleted: boolean;
    };
}
