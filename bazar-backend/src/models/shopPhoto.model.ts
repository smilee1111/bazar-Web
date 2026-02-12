import mongoose, { Document, Schema } from "mongoose";
import { ShopPhotoType } from "../types/shopPhoto.type";

export interface IShopPhoto extends ShopPhotoType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ShopPhotoSchema: Schema = new Schema(
    {
        photoId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        photoName: { type: String, required: true },
        shopId: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'shop_photos'
    }
);

export const ShopPhotoModel = mongoose.model<IShopPhoto>('ShopPhoto', ShopPhotoSchema);
