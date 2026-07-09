import { HttpError } from "../../errors/http-error";
import { ReviewDislikeRepository } from "../../repositories/reviewDislike.repository";
import { ShopReviewRepository } from "../../repositories/shopReview.repository";
import { ShopRepository } from "../../repositories/shop.repository";
import { NotificationHelperService } from "../user/notificationHelper.service";

const reviewDislikeRepository = new ReviewDislikeRepository();
const shopReviewRepository = new ShopReviewRepository();
const shopRepository = new ShopRepository();
const notificationHelper = new NotificationHelperService();

export class ReviewDislikeService {
    /**
     * Dislike a review
     * Checks if user already disliked, if not creates dislike and increments count
     */
    async dislikeReview(reviewId: string, userId: string) {
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        // Check if already disliked
        const isDisliked = await reviewDislikeRepository.isDisliked(reviewId, userId);
        if (isDisliked) {
            throw new HttpError(400, "You have already disliked this review");
        }

        // Create dislike
        await reviewDislikeRepository.createDislike(reviewId, userId);

        // Increment dislikeCount
        const currentDislikes = review.dislikeCount || 0;
        const updated = await shopReviewRepository.updateReview(reviewId, {
            dislikeCount: currentDislikes + 1
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

            await notificationHelper.notifyReviewDisliked(reviewOwnerId, userId, reviewId, shopName);
        } catch (error) {
            console.error('Failed to send review dislike notification:', error);
            // Don't fail the dislike operation if notification fails
        }

        return updated;
    }

    /**
     * Undislike a review
     * Deletes the dislike and decrements count
     */
    async undislikeReview(reviewId: string, userId: string) {
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        // Check if disliked
        const isDisliked = await reviewDislikeRepository.isDisliked(reviewId, userId);
        if (!isDisliked) {
            throw new HttpError(400, "You have not disliked this review");
        }

        // Remove dislike
        await reviewDislikeRepository.removeDislike(reviewId, userId);

        // Decrement dislikeCount
        const currentDislikes = review.dislikeCount || 0;
        const newDislikesCount = Math.max(0, currentDislikes - 1);
        const updated = await shopReviewRepository.updateReview(reviewId, {
            dislikeCount: newDislikesCount
        } as any);

        return updated;
    }

    /**
     * Check if user disliked a review
     */
    async isUserDislikedReview(reviewId: string, userId: string): Promise<boolean> {
        return reviewDislikeRepository.isDisliked(reviewId, userId);
    }

    /**
     * Get dislikes count for a review
     */
    async getDislikesCount(reviewId: string): Promise<number> {
        return reviewDislikeRepository.getDislikesCount(reviewId);
    }

    /**
     * Get all dislikes for a review (with user details)
     */
    async getReviewDislikes(reviewId: string) {
        return reviewDislikeRepository.getReviewDislikes(reviewId);
    }

    /**
     * Get all dislikes by a user
     */
    async getUserDislikes(userId: string) {
        return reviewDislikeRepository.getUserDislikes(userId);
    }
}
