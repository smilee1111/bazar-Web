import mongoose, { Document, Schema } from "mongoose";
import { ShopType } from "../types/shop.type";

export interface IShop extends ShopType, Document {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId | string;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
    {
        shopId: { type: String, required: true, unique: true, trim: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        shopName: { type: String, required: true, unique: true },
        slug: { type: String, required: false, unique: true, sparse: true },
        description: { type: String, required: false },
        shopAddress: { type: String, required: true },
        shopContact: { type: String, required: true },
        contactNumber: { type: String, required: false },
        email: { type: String, required: false },
        categoryId: { type: String, required: false },
        priceRange: { type: String, required: false },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: false }, // [lng, lat]
        },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        collection: 'shops'
    }
);

// Geo index for map queries/routing
ShopSchema.index({ location: '2dsphere' });

export const ShopModel = mongoose.model<IShop>('Shop', ShopSchema);
