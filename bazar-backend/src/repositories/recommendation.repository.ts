import mongoose from "mongoose";
import { IShop, ShopModel } from "../models/shop.model";
import { IUserBehaviour, UserBehaviourModel } from "../interactions_userbehaviour/models/userBehaviour.model";
import { FavouriteModel } from "../models/favourite.model";
import { SavedShopModel } from "../models/savedShop.model";

export interface IRecommendationRepository {
    getUserBehaviourHistory(userId: string): Promise<IUserBehaviour[]>;
    getShopsNearLocation(lat: number, lng: number, radiusKm: number): Promise<IShop[]>;
    getUserInteractedShopIds(userId: string): Promise<string[]>;
}

export class RecommendationRepository implements IRecommendationRepository {
    async getUserBehaviourHistory(userId: string): Promise<IUserBehaviour[]> {
        return UserBehaviourModel.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
    }

    async getShopsNearLocation(lat: number, lng: number, radiusKm: number): Promise<IShop[]> {
        return ShopModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [lng, lat] },
                    distanceField: "dist.calculated",
                    maxDistance: radiusKm * 1000, // metres
                    query: { isActive: true },
                    spherical: true,
                }
            }
        ]);
    }

    async getUserInteractedShopIds(userId: string): Promise<string[]> {
        const userObjId = new mongoose.Types.ObjectId(userId);
        
        const [favourites, savedShops, behaviourLogs] = await Promise.all([
            FavouriteModel.find({ userId: userObjId }).select("shopId").lean(),
            SavedShopModel.find({ userId: userObjId }).select("shopId").lean(),
            UserBehaviourModel.find({
                userId: userObjId,
                eventType: { $in: ["save", "favorite"] }
            }).select("shopId").lean(),
        ]);

        const ids = new Set<string>();
        favourites.forEach(f => {
            if (f.shopId) ids.add(f.shopId.toString());
        });
        savedShops.forEach(s => {
            if (s.shopId) ids.add(s.shopId.toString());
        });
        behaviourLogs.forEach(log => {
            if (log.shopId) ids.add(log.shopId.toString());
        });

        return Array.from(ids);
    }
}
