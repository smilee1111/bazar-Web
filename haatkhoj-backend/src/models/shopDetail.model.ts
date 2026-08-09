import mongoose, { Document, Schema } from "mongoose";
import { ShopDetailType } from "../types/shopDetail.type";

export interface IShopDetail extends ShopDetailType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ShopDetailSchema: Schema = new Schema(
    {
        detailId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        link1: { type: String, required: false },
        link2: { type: String, required: false },
        link3: { type: String, required: false },
        link4: { type: String, required: false },
        shopId: { type: String, required: true }
    },
    {
        timestamps: true,
        collection: 'shop_details'
    }
);

export const ShopDetailModel = mongoose.model<IShopDetail>('ShopDetail', ShopDetailSchema);
