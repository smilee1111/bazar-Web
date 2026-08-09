import { NotificationRepository } from "../../repositories/notification.repository";
import { UserRepository } from "../../repositories/user.repository";

const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();

/**
 * Helper service for creating notifications in various scenarios
 */
export class NotificationHelperService {
    /**
     * Notify user when someone likes their review
     */
    async notifyReviewLiked(reviewOwnerId: string, likedByUserId: string, reviewId: string, shopName?: string) {
        try {
            // Don't notify if user liked their own review
            if (reviewOwnerId === likedByUserId) {
                return;
            }

            const likedByUser = await userRepository.getUserById(likedByUserId);
            const userName = likedByUser?.fullName || likedByUser?.username || 'Someone';

            await notificationRepository.createNotification({
                userId: reviewOwnerId,
                type: 'review_like',
                title: 'Review Liked',
                message: `${userName} liked your review${shopName ? ` on ${shopName}` : ''}`,
                relatedEntityId: reviewId,
                relatedEntityType: 'review',
                metadata: {
                    likedByUserId,
                    likedByUserName: userName,
                    shopName
                }
            });
        } catch (error) {
            console.error('Failed to create review like notification:', error);
        }
    }

    /**
     * Notify user when someone dislikes their review
     */
    async notifyReviewDisliked(reviewOwnerId: string, dislikedByUserId: string, reviewId: string, shopName?: string) {
        try {
            // Don't notify if user disliked their own review
            if (reviewOwnerId === dislikedByUserId) {
                return;
            }

            const dislikedByUser = await userRepository.getUserById(dislikedByUserId);
            const userName = dislikedByUser?.fullName || dislikedByUser?.username || 'Someone';

            await notificationRepository.createNotification({
                userId: reviewOwnerId,
                type: 'review_dislike',
                title: 'Review Disliked',
                message: `${userName} disliked your review${shopName ? ` on ${shopName}` : ''}`,
                relatedEntityId: reviewId,
                relatedEntityType: 'review',
                metadata: {
                    dislikedByUserId,
                    dislikedByUserName: userName,
                    shopName
                }
            });
        } catch (error) {
            console.error('Failed to create review dislike notification:', error);
        }
    }

    /**
     * Notify seller when someone reviews their shop
     */
    async notifyShopReviewed(shopOwnerId: string, reviewerId: string, shopId: string, shopName: string, starNum: number) {
        try {
            // Don't notify if owner somehow reviewed own shop (shouldn't happen)
            if (shopOwnerId === reviewerId) {
                return;
            }

            const reviewer = await userRepository.getUserById(reviewerId);
            const reviewerName = reviewer?.fullName || reviewer?.username || 'Someone';

            await notificationRepository.createNotification({
                userId: shopOwnerId,
                type: 'shop_reviewed',
                title: 'New Review',
                message: `${reviewerName} gave ${starNum} star${starNum !== 1 ? 's' : ''} to ${shopName}`,
                relatedEntityId: shopId,
                relatedEntityType: 'shop',
                metadata: {
                    reviewerId,
                    reviewerName,
                    shopName,
                    starNum
                }
            });
        } catch (error) {
            console.error('Failed to create shop review notification:', error);
        }
    }

    /**
     * Notify all users when a new shop is added
     */
    async notifyNewShop(shopId: string, shopName: string, excludeUserId?: string) {
        try {
            // Get all users
            const { users } = await userRepository.getAllUsers(1, 10000);
            
            // Create notifications for each user except the shop owner
            const notifications = users
                .filter(user => user._id.toString() !== excludeUserId)
                .map(user => ({
                    userId: user._id.toString(),
                    type: 'new_shop' as const,
                    title: 'New Shop Added',
                    message: `${shopName} is now available on HaatKhoj!`,
                    relatedEntityId: shopId,
                    relatedEntityType: 'shop' as const,
                    metadata: {
                        shopName
                    }
                }));

            // Create notifications in batches to avoid overwhelming the database
            const batchSize = 100;
            for (let i = 0; i < notifications.length; i += batchSize) {
                const batch = notifications.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(notif => notificationRepository.createNotification(notif))
                );
            }
        } catch (error) {
            console.error('Failed to create new shop notifications:', error);
        }
    }

    /**
     * Send a general notification to a user
     */
    async notifyGeneral(userId: string, title: string, message: string, relatedEntityId?: string, relatedEntityType?: 'shop' | 'review' | 'user', metadata?: Record<string, any>) {
        try {
            await notificationRepository.createNotification({
                userId,
                type: 'general',
                title,
                message,
                relatedEntityId,
                relatedEntityType,
                metadata
            });
        } catch (error) {
            console.error('Failed to create general notification:', error);
        }
    }

    /**
     * Send a general notification to multiple users
     */
    async notifyMultipleUsers(userIds: string[], title: string, message: string, relatedEntityId?: string, relatedEntityType?: 'shop' | 'review' | 'user', metadata?: Record<string, any>) {
        try {
            const notifications = userIds.map(userId => ({
                userId,
                type: 'general' as const,
                title,
                message,
                relatedEntityId,
                relatedEntityType,
                metadata
            }));

            await Promise.all(
                notifications.map(notif => notificationRepository.createNotification(notif))
            );
        } catch (error) {
            console.error('Failed to create multiple user notifications:', error);
        }
    }

    /**
     * Notify admins when a new seller application is submitted
     */
    async notifySellerApplication(applicantId: string, applicationId: string, businessName: string) {
        try {
            // Get user details
            const applicant = await userRepository.getUserById(applicantId);
            const applicantName = applicant?.fullName || applicant?.username || 'A user';

            // Get all admin users
            const admins = await userRepository.getUserByRoleName('admin');
            
            if (admins.length === 0) {
                console.warn('No admins found to notify about seller application');
                return;
            }

            // Create notifications for each admin
            const notifications = admins.map(admin => ({
                userId: admin._id.toString(),
                type: 'seller_application' as const,
                title: 'New Seller Application',
                message: `${applicantName} submitted an application for "${businessName}"`,
                relatedEntityId: applicationId,
                relatedEntityType: 'user' as const,
                metadata: {
                    applicantId,
                    applicantName,
                    businessName,
                    applicationId
                }
            }));

            await Promise.all(
                notifications.map(notif => notificationRepository.createNotification(notif))
            );
        } catch (error) {
            console.error('Failed to create seller application notifications:', error);
        }
    }
}
