import { HttpError } from "../../errors/http-error";
import { ReviewLikeRepository } from "../../repositories/reviewLike.repository";
import { ShopReviewRepository } from "../../repositories/shopReview.repository";
import { ShopRepository } from "../../repositories/shop.repository";
import { NotificationHelperService } from "../user/notificationHelper.service";

const reviewLikeRepository = new ReviewLikeRepository();
const shopReviewRepository = new ShopReviewRepository();
const shopRepository = new ShopRepository();
const notificationHelper = new NotificationHelperService();

export class ReviewLikeService {
    /**
     * Like a review
     * Checks if user already liked, if not creates like and increments count
     */
    async likeReview(reviewId: string, userId: string) {
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        // Check if already liked
        const isLiked = await reviewLikeRepository.isLiked(reviewId, userId);
        if (isLiked) {
            throw new HttpError(400, "You have already liked this review");
        }

        // Create like
        await reviewLikeRepository.createLike(reviewId, userId);

        // Increment likesCount
        const currentLikes = review.likesCount || 0;
        const updated = await shopReviewRepository.updateReview(reviewId, {
            likesCount: currentLikes + 1
        } as any);

        // Send notification to review owner
        try {
            const reviewOwnerId = typeof review.reviewedBy === 'object' && review.reviewedBy?._id
                ? review.reviewedBy._id.toString()
                : review.reviewedBy?.toString();

            // Get shop name for better notification context
            let shopName: string | undefined;
            try {
                const shop = await shopRepository.getShopByIdOrShopId(review.shopId);
                shopName = shop?.shopName;
            } catch (e) {
                // Ignore if shop not found
            }

            await notificationHelper.notifyReviewLiked(reviewOwnerId, userId, reviewId, shopName);
        } catch (error) {
            console.error('Failed to send review like notification:', error);
            // Don't fail the like operation if notification fails
        }

        return updated;
    }

    /**
     * Unlike a review
     * Deletes the like and decrements count
     */
    async unlikeReview(reviewId: string, userId: string) {
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        // Check if liked
        const isLiked = await reviewLikeRepository.isLiked(reviewId, userId);
        if (!isLiked) {
            throw new HttpError(400, "You have not liked this review");
        }

        // Remove like
        await reviewLikeRepository.removeLike(reviewId, userId);

        // Decrement likesCount
        const currentLikes = review.likesCount || 0;
        const newLikesCount = Math.max(0, currentLikes - 1);
        const updated = await shopReviewRepository.updateReview(reviewId, {
            likesCount: newLikesCount
        } as any);

        return updated;
    }

    /**
     * Check if user liked a review
     */
    async isUserLikedReview(reviewId: string, userId: string): Promise<boolean> {
        return reviewLikeRepository.isLiked(reviewId, userId);
    }

    /**
     * Get likes count for a review
     */
    async getLikesCount(reviewId: string): Promise<number> {
        return reviewLikeRepository.getLikesCount(reviewId);
    }

    /**
     * Get all likes for a review (with user details)
     */
    async getReviewLikes(reviewId: string) {
        return reviewLikeRepository.getReviewLikes(reviewId);
    }

    /**
     * Get all likes by a user
     */
    async getUserLikes(userId: string) {
        return reviewLikeRepository.getUserLikes(userId);
    }
}
