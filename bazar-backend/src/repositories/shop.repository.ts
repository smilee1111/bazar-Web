import { IShop, ShopModel } from "../models/shop.model";

export interface IShopRepository {
    createShop(data: Partial<IShop>): Promise<IShop>;
    getShopById(id: string): Promise<IShop | null>;
    getShopByOwnerId(ownerId: string): Promise<IShop | null>;
    getAllShops(): Promise<IShop[]>;
    updateShop(id: string, data: Partial<IShop>): Promise<IShop | null>;
    deleteShop(id: string): Promise<boolean | null>;
}

export class ShopRepository implements IShopRepository {
    async createShop(data: Partial<IShop>): Promise<IShop> {
        const newShop = new ShopModel(data);
        await newShop.save();
        return newShop;
    }

    async getShopById(id: string): Promise<IShop | null> {
        const shop = await ShopModel.findById(id);
        return shop;
    }

    async getShopByOwnerId(ownerId: string): Promise<IShop | null> {
        const shop = await ShopModel.findOne({ ownerId: ownerId });
        return shop;
    }

    async getAllShops(): Promise<IShop[]> {
        const shops = await ShopModel.find();
        return shops;
    }

    async updateShop(id: string, data: Partial<IShop>): Promise<IShop | null> {
        const updatedShop = await ShopModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return updatedShop;
    }

    async deleteShop(id: string): Promise<boolean | null> {
        const result = await ShopModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}