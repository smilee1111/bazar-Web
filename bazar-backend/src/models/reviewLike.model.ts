import mongoose, { Document, Schema } from "mongoose";

export interface IReviewLike extends Document {
    _id: mongoose.Types.ObjectId;
    reviewId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewLikeSchema: Schema = new Schema(
    {
        reviewId: { type: Schema.Types.ObjectId, ref: 'ShopReview', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true,
        collection: 'review_likes'
    }
);

// Create a unique index to prevent duplicate likes (one user = one like per review)
ReviewLikeSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export const ReviewLikeModel = mongoose.model<IReviewLike>('ReviewLike', ReviewLikeSchema);
