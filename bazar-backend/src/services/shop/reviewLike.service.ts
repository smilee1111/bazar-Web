import { HttpError } from "../../errors/http-error";
import { ReviewLikeRepository } from "../../repositories/reviewLike.repository";
import { ShopReviewRepository } from "../../repositories/shopReview.repository";

const reviewLikeRepository = new ReviewLikeRepository();
const shopReviewRepository = new ShopReviewRepository();

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
