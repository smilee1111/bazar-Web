import { IReviewLike, ReviewLikeModel } from "../models/reviewLike.model";

export interface IReviewLikeRepository {
    createLike(reviewId: string, userId: string): Promise<IReviewLike>;
    removeLike(reviewId: string, userId: string): Promise<boolean>;
    isLiked(reviewId: string, userId: string): Promise<boolean>;
    getLikesCount(reviewId: string): Promise<number>;
    getUserLikes(userId: string): Promise<IReviewLike[]>;
    getReviewLikes(reviewId: string): Promise<IReviewLike[]>;
}

export class ReviewLikeRepository implements IReviewLikeRepository {
    async createLike(reviewId: string, userId: string): Promise<IReviewLike> {
        // Check if like already exists
        const existingLike = await ReviewLikeModel.findOne({ reviewId, userId });
        if (existingLike) {
            return existingLike;
        }

        const newLike = new ReviewLikeModel({ reviewId, userId });
        await newLike.save();
        return newLike;
    }

    async removeLike(reviewId: string, userId: string): Promise<boolean> {
        const result = await ReviewLikeModel.deleteOne({ reviewId, userId });
        return result.deletedCount > 0;
    }

    async isLiked(reviewId: string, userId: string): Promise<boolean> {
        const like = await ReviewLikeModel.findOne({ reviewId, userId });
        return !!like;
    }

    async getLikesCount(reviewId: string): Promise<number> {
        return ReviewLikeModel.countDocuments({ reviewId });
    }

    async getUserLikes(userId: string): Promise<IReviewLike[]> {
        return ReviewLikeModel.find({ userId }).lean();
    }

    async getReviewLikes(reviewId: string): Promise<IReviewLike[]> {
        return ReviewLikeModel.find({ reviewId }).populate('userId', 'fullName email').lean();
    }
}
