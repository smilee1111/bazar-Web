import { SavedShopModel, ISavedShop } from "../models/savedShop.model";
import mongoose from 'mongoose';

export interface ISavedShopRepository {
    addSavedShop(userId: string, shopId: string): Promise<ISavedShop>;
    removeSavedShop(userId: string, shopId: string): Promise<boolean>;
    getSavedShopsByUser(userId: string): Promise<ISavedShop[]>;
}

export class SavedShopRepository implements ISavedShopRepository {
    async addSavedShop(userId: string, shopId: string): Promise<ISavedShop> {
        const doc = new SavedShopModel({ userId: new mongoose.Types.ObjectId(userId), shopId });
        await doc.save();
        return doc;
    }

    async removeSavedShop(userId: string, shopId: string): Promise<boolean> {
        const res = await SavedShopModel.findOneAndDelete({ userId, shopId });
        return !!res;
    }

    async getSavedShopsByUser(userId: string): Promise<ISavedShop[]> {
        return SavedShopModel.find({ userId }).lean();
    }
}
