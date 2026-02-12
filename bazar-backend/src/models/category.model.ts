import mongoose, { Document, Schema } from "mongoose";
import { CategoryType } from "../types/category.type";

export interface ICategory extends CategoryType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        categoryId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        categoryName: {
            type: String,
            required: true,
            unique: true,
        }
    },
    {
        timestamps: true,
        collection: 'categories'
    }
);

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
