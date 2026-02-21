import mongoose, { Document, Schema } from "mongoose";
import { SellerApplicationType } from "../types/sellerApplication.type";

export interface ISellerApplication extends SellerApplicationType, Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const SellerApplicationSchema: Schema = new Schema(
    {
        applicationId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        businessName: { type: String, required: true },
        categoryName: { type: String, required: true },
        businessPhone: { type: String, required: true, unique: true },
        businessAddress: { type: String, required: true },
        description: { type: String, required: false },
        documentUrl: { type: String, required: true },
        status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
        adminRemark: { type: String, required: false, default: null }
    },
    {
        timestamps: true,
        collection: 'seller_applications'
    }
);

export const SellerApplicationModel = mongoose.model<ISellerApplication>('SellerApplication', SellerApplicationSchema);
