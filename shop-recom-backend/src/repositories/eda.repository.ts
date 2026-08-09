import { ShopModel } from "../models/shop.model";
import { ShopPhotoModel } from "../models/shopPhoto.model";
import { ShopDetailModel } from "../models/shopDetail.model";
import { ShopReviewModel } from "../models/shopReview.model";
import { CategoryModel } from "../models/category.model";
import { UserBehaviourModel } from "../interactions_userbehaviour/models/userBehaviour.model";

export interface ShopSummary {
    _id: string;
    shopId: string;
    source: string;
    categoryId?: string;
    hasDescription: boolean;
    coordinates?: [number, number];
}

export interface IEdaRepository {
    getAllShopsSummary(): Promise<ShopSummary[]>;
    getCategoryNames(): Promise<Map<string, string>>;
    getShopIdsWithPhotos(): Promise<Set<string>>;
    getShopIdsWithWebsite(): Promise<Set<string>>;
    getShopIdsWithReviews(): Promise<Set<string>>;
    getBehaviourEventCounts(): Promise<Array<{ eventType: string; count: number }>>;
    getInteractionsPerUser(): Promise<number[]>;
    getDailyInteractionCounts(days: number): Promise<Array<{ date: string; count: number }>>;
}

export class EdaRepository implements IEdaRepository {
    async getAllShopsSummary(): Promise<ShopSummary[]> {
        const shops = await ShopModel.find({ isActive: true })
            .select("_id shopId source categoryId description location")
            .lean();

        return shops.map(s => ({
            _id: s._id.toString(),
            shopId: (s as any).shopId,
            source: (s as any).source || "internal",
            categoryId: (s as any).categoryId,
            hasDescription: Boolean((s as any).description && (s as any).description.trim().length > 0),
            coordinates: (s as any).location?.coordinates
        }));
    }

    async getCategoryNames(): Promise<Map<string, string>> {
        const categories = await CategoryModel.find().select("_id categoryId categoryName").lean();
        const map = new Map<string, string>();
        categories.forEach((c: any) => {
            map.set(c._id.toString(), c.categoryName);
            if (c.categoryId) map.set(c.categoryId, c.categoryName);
        });
        return map;
    }

    async getShopIdsWithPhotos(): Promise<Set<string>> {
        const ids = await ShopPhotoModel.distinct("shopId", { isActive: true });
        return new Set(ids.map(String));
    }

    async getShopIdsWithWebsite(): Promise<Set<string>> {
        const ids = await ShopDetailModel.distinct("shopId", { link1: { $exists: true, $nin: [null, ""] } });
        return new Set(ids.map(String));
    }

    async getShopIdsWithReviews(): Promise<Set<string>> {
        const ids = await ShopReviewModel.distinct("shopId", { isActive: true });
        return new Set(ids.map(String));
    }

    async getBehaviourEventCounts(): Promise<Array<{ eventType: string; count: number }>> {
        const results = await UserBehaviourModel.aggregate([
            { $group: { _id: "$eventType", count: { $sum: 1 } } }
        ]);
        return results.map(r => ({ eventType: r._id, count: r.count }));
    }

    async getInteractionsPerUser(): Promise<number[]> {
        const results = await UserBehaviourModel.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } }
        ]);
        return results.map(r => r.count);
    }

    async getDailyInteractionCounts(days: number): Promise<Array<{ date: string; count: number }>> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const results = await UserBehaviourModel.aggregate([
            { $match: { timestamp: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return results.map(r => ({ date: r._id, count: r.count }));
    }
}
