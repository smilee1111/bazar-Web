import { IShopDetail, ShopDetailModel } from "../models/shopDetail.model";

const isObjectIdString = (value: string) => /^[a-f\d]{24}$/i.test(value);

export interface IShopDetailRepository {
    createDetail(data: Partial<IShopDetail>): Promise<IShopDetail>;
    getDetailById(id: string): Promise<IShopDetail | null>;
    getDetailByShopId(shopId: string): Promise<IShopDetail | null>;
    getDetailsByShopIds(shopIds: string[]): Promise<IShopDetail[]>;
    getAllDetails(): Promise<IShopDetail[]>;
    updateDetail(id: string, data: Partial<IShopDetail>): Promise<IShopDetail | null>;
    deleteDetail(id: string): Promise<boolean | null>;
}

export class ShopDetailRepository implements IShopDetailRepository {
    async createDetail(data: Partial<IShopDetail>): Promise<IShopDetail> {
        const newDetail = new ShopDetailModel(data);
        await newDetail.save();
        return newDetail;
    }

    async getDetailById(id: string): Promise<IShopDetail | null> {
        const query = isObjectIdString(id)
            ? { $or: [{ _id: id }, { detailId: id }] }
            : { detailId: id };
        const detail = await ShopDetailModel.findOne(query);
        return detail;
    }

    async getDetailByShopId(shopId: string): Promise<IShopDetail | null> {
        const detail = await ShopDetailModel.findOne({ shopId });
        return detail;
    }

    async getDetailsByShopIds(shopIds: string[]): Promise<IShopDetail[]> {
        const uniqueIds = Array.from(new Set(shopIds.filter(Boolean)));
        if (uniqueIds.length === 0) {
            return [];
        }
        return ShopDetailModel.find({ shopId: { $in: uniqueIds } });
    }

    async getAllDetails(): Promise<IShopDetail[]> {
        return ShopDetailModel.find({});
    }

    async updateDetail(id: string, data: Partial<IShopDetail>): Promise<IShopDetail | null> {
        const existing = await this.getDetailById(id);
        if (!existing) return null;
        const updated = await ShopDetailModel.findByIdAndUpdate(existing._id, data, {
            new: true,
            runValidators: true,
        });
        return updated;
    }

    async deleteDetail(id: string): Promise<boolean | null> {
        const existing = await this.getDetailById(id);
        if (!existing) return null;
        const result = await ShopDetailModel.findByIdAndDelete(existing._id);
        return result ? true : null;
    }
}
