import { FavouriteModel, IFavourite } from "../models/favourite.model";
import mongoose from 'mongoose';

export interface IFavouriteRepository {
    addFavourite(userId: string, shopId: string): Promise<IFavourite>;
    removeFavourite(userId: string, shopId: string): Promise<boolean>;
    getFavouritesByUser(userId: string): Promise<IFavourite[]>;
}

export class FavouriteRepository implements IFavouriteRepository {
    async addFavourite(userId: string, shopId: string): Promise<IFavourite> {
        const doc = new FavouriteModel({ userId: new mongoose.Types.ObjectId(userId), shopId });
        await doc.save();
        return doc;
    }

    async removeFavourite(userId: string, shopId: string): Promise<boolean> {
        const res = await FavouriteModel.findOneAndDelete({ userId, shopId });
        return !!res;
    }

    async getFavouritesByUser(userId: string): Promise<IFavourite[]> {
        return FavouriteModel.find({ userId }).lean();
    }
}
