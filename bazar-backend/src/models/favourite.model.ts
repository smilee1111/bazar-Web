import mongoose, { Document, Schema } from "mongoose";

export interface IFavourite extends Document {
    shopId: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FavouriteSchema: Schema = new Schema(
    {
        shopId: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
        collection: 'favourites'
    }
);

// prevent duplicate favourites per user
FavouriteSchema.index({ shopId: 1, userId: 1 }, { unique: true });

export const FavouriteModel = mongoose.model<IFavourite>('Favourite', FavouriteSchema);
