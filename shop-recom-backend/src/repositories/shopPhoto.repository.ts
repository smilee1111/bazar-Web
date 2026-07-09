import { IShopPhoto, ShopPhotoModel } from "../models/shopPhoto.model";

const isObjectIdString = (value: string) => /^[a-f\d]{24}$/i.test(value);

export interface IShopPhotoRepository {
    createPhoto(data: Partial<IShopPhoto>): Promise<IShopPhoto>;
    getPhotoById(id: string): Promise<IShopPhoto | null>;
    getPhotosByShopIds(shopIds: string[]): Promise<IShopPhoto[]>;
    updatePhoto(id: string, data: Partial<IShopPhoto>): Promise<IShopPhoto | null>;
    deletePhoto(id: string): Promise<boolean | null>;
}

export class ShopPhotoRepository implements IShopPhotoRepository {
    async createPhoto(data: Partial<IShopPhoto>): Promise<IShopPhoto> {
        const newPhoto = new ShopPhotoModel(data);
        await newPhoto.save();
        return newPhoto;
    }

    async getPhotoById(id: string): Promise<IShopPhoto | null> {
        const query = isObjectIdString(id)
            ? { $or: [{ _id: id }, { photoId: id }] }
            : { photoId: id };
        const photo = await ShopPhotoModel.findOne(query);
        return photo;
    }

    async getPhotosByShopIds(shopIds: string[]): Promise<IShopPhoto[]> {
        const uniqueIds = Array.from(new Set(shopIds.filter(Boolean)));
        if (uniqueIds.length === 0) {
            return [];
        }
        return ShopPhotoModel.find({ shopId: { $in: uniqueIds }, isActive: true });
    }

    async updatePhoto(id: string, data: Partial<IShopPhoto>): Promise<IShopPhoto | null> {
        const existing = await this.getPhotoById(id);
        if (!existing) return null;
        const updated = await ShopPhotoModel.findByIdAndUpdate(existing._id, data, {
            new: true,
            runValidators: true,
        });
        return updated;
    }

    async deletePhoto(id: string): Promise<boolean | null> {
        const existing = await this.getPhotoById(id);
        if (!existing) return null;
        const result = await ShopPhotoModel.findByIdAndDelete(existing._id);
        return result ? true : null;
    }
}
