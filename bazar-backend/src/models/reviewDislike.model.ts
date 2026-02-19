import mongoose, { Document, Schema } from "mongoose";

export interface IReviewDislike extends Document {
    _id: mongoose.Types.ObjectId;
    reviewId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewDislikeSchema: Schema = new Schema(
    {
        reviewId: { type: Schema.Types.ObjectId, ref: 'ShopReview', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true,
        collection: 'review_dislikes'
    }
);

// Create a unique index to prevent duplicate dislikes (one user = one dislike per review)
ReviewDislikeSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export const ReviewDislikeModel = mongoose.model<IReviewDislike>('ReviewDislike', ReviewDislikeSchema);
