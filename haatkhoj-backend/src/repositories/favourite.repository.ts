import { FavouriteModel, IFavourite } from "../models/favourite.model";
import mongoose from 'mongoose';

export interface IFavouriteRepository {
    addFavourite(userId: string, shopId: string, isReviewed?: boolean): Promise<IFavourite>;
    removeFavourite(userId: string, shopId: string): Promise<boolean>;
    getFavouritesByUser(userId: string): Promise<IFavourite[]>;
    markAsReviewed(userId: string, shopId: string): Promise<IFavourite>;
}

export class FavouriteRepository implements IFavouriteRepository {
    async addFavourite(userId: string, shopId: string, isReviewed: boolean = false): Promise<IFavourite> {
        const doc = new FavouriteModel({ userId: new mongoose.Types.ObjectId(userId), shopId, isReviewed });
        await doc.save();
        return doc;
    }

    async markAsReviewed(userId: string, shopId: string): Promise<IFavourite> {
        const result = await FavouriteModel.findOneAndUpdate(
            { userId, shopId },
            { isReviewed: true },
            { upsert: true, new: true }
        );
        return result as IFavourite;
    }

    async removeFavourite(userId: string, shopId: string): Promise<boolean> {
        const res = await FavouriteModel.findOneAndDelete({ userId, shopId });
        return !!res;
    }

    async getFavouritesByUser(userId: string): Promise<IFavourite[]> {
        return FavouriteModel.find({ userId }).lean();
    }
}
