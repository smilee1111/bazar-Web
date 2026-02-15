import { IShopReview, ShopReviewModel } from "../models/shopReview.model";

const isObjectIdString = (value: string) => /^[a-f\d]{24}$/i.test(value);

export interface IShopReviewRepository {
    createReview(data: Partial<IShopReview>): Promise<IShopReview>;
    getReviewById(id: string): Promise<IShopReview | null>;
    getReviewsByShopIds(shopIds: string[]): Promise<IShopReview[]>;
    updateReview(id: string, data: Partial<IShopReview>): Promise<IShopReview | null>;
    deleteReview(id: string): Promise<boolean | null>;
}

export class ShopReviewRepository implements IShopReviewRepository {
    async createReview(data: Partial<IShopReview>): Promise<IShopReview> {
        const newReview = new ShopReviewModel(data);
        await newReview.save();
        return newReview;
    }

    async getReviewById(id: string): Promise<IShopReview | null> {
        const query = isObjectIdString(id)
            ? { $or: [{ _id: id }, { reviewId: id }] }
            : { reviewId: id };
        const review = await ShopReviewModel.findOne(query);
        return review;
    }

    async getReviewsByShopIds(shopIds: string[]): Promise<IShopReview[]> {
        const uniqueIds = Array.from(new Set(shopIds.filter(Boolean)));
        if (uniqueIds.length === 0) {
            return [];
        }
        return ShopReviewModel.find({ shopId: { $in: uniqueIds }, isActive: true });
    }

    async updateReview(id: string, data: Partial<IShopReview>): Promise<IShopReview | null> {
        const existing = await this.getReviewById(id);
        if (!existing) return null;
        const updated = await ShopReviewModel.findByIdAndUpdate(existing._id, data, {
            new: true,
            runValidators: true,
        });
        return updated;
    }

    async deleteReview(id: string): Promise<boolean | null> {
        const existing = await this.getReviewById(id);
        if (!existing) return null;
        const result = await ShopReviewModel.findByIdAndDelete(existing._id);
        return result ? true : null;
    }
}
