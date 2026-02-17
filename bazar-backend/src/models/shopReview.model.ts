import mongoose, { Document, Schema } from "mongoose";
import { ShopReviewType } from "../types/shopReview.type";

export interface IShopReview extends ShopReviewType, Document {
    _id: mongoose.Types.ObjectId;
    reviewedBy: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const ShopReviewSchema: Schema = new Schema(
    {
        reviewId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        reviewName: { type: String, required: true },
        shopId: { type: String, required: true },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        starNum: { type: Number, required: true, min: 1, max: 5 },
        likesCount: { type: Number, default: 0 },
        dislikeCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        collection: 'shop_reviews'
    }
);

export const ShopReviewModel = mongoose.model<IShopReview>('ShopReview', ShopReviewSchema);
