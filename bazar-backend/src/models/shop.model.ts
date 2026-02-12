import mongoose, { Document, Schema } from "mongoose";
import { ShopType } from "../types/shop.type";

export interface IShop extends ShopType, Document {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
    {
        shopId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        shopName: { type: String, required: true, unique: true },
        slug: { type: String, required: false, unique: true },
        description: { type: String, required: false },
        shopAddress: { type: String, required: true },
        shopContact: { type: String, required: true },
        categoryId: { type: String, required: false },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        collection: 'shops'
    }
);

export const ShopModel = mongoose.model<IShop>('Shop', ShopSchema);
