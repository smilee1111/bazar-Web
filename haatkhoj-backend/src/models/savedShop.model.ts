import mongoose, { Document, Schema } from "mongoose";

export interface ISavedShop extends Document {
    shopId: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SavedShopSchema: Schema = new Schema(
    {
        shopId: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
        collection: 'saved_shops'
    }
);

// prevent duplicate saves per user
SavedShopSchema.index({ shopId: 1, userId: 1 }, { unique: true });

export const SavedShopModel = mongoose.model<ISavedShop>('SavedShop', SavedShopSchema);
