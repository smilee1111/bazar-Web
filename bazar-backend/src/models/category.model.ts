import mongoose, { Document, Schema } from "mongoose";
import { CategoryType } from "../types/category.type";

export interface ICategory extends CategoryType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        categoryId: { type: String, required: true, unique: true },
        categoryName: {
            type: String,
            required: true,
            unique: true,
            enum: ['Furniture', 'Electronics', 'Clothing', 'Books', 'Groceries', 'Other'],
            default: 'Other'
        }
    },
    {
        timestamps: true,
        collection: 'categories'
    }
);

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
