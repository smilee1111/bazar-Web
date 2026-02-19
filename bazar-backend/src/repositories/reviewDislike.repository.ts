import { IReviewDislike, ReviewDislikeModel } from "../models/reviewDislike.model";

export interface IReviewDislikeRepository {
    createDislike(reviewId: string, userId: string): Promise<IReviewDislike>;
    removeDislike(reviewId: string, userId: string): Promise<boolean>;
    isDisliked(reviewId: string, userId: string): Promise<boolean>;
    getDislikesCount(reviewId: string): Promise<number>;
    getUserDislikes(userId: string): Promise<IReviewDislike[]>;
    getReviewDislikes(reviewId: string): Promise<IReviewDislike[]>;
}

export class ReviewDislikeRepository implements IReviewDislikeRepository {
    async createDislike(reviewId: string, userId: string): Promise<IReviewDislike> {
        // Check if dislike already exists
        const existingDislike = await ReviewDislikeModel.findOne({ reviewId, userId });
        if (existingDislike) {
            return existingDislike;
        }

        const newDislike = new ReviewDislikeModel({ reviewId, userId });
        await newDislike.save();
        return newDislike;
    }

    async removeDislike(reviewId: string, userId: string): Promise<boolean> {
        const result = await ReviewDislikeModel.deleteOne({ reviewId, userId });
        return result.deletedCount > 0;
    }

    async isDisliked(reviewId: string, userId: string): Promise<boolean> {
        const dislike = await ReviewDislikeModel.findOne({ reviewId, userId });
        return !!dislike;
    }

    async getDislikesCount(reviewId: string): Promise<number> {
        return ReviewDislikeModel.countDocuments({ reviewId });
    }

    async getUserDislikes(userId: string): Promise<IReviewDislike[]> {
        return ReviewDislikeModel.find({ userId }).lean();
    }

    async getReviewDislikes(reviewId: string): Promise<IReviewDislike[]> {
        return ReviewDislikeModel.find({ reviewId }).populate('userId', 'fullName email').lean();
    }
}
