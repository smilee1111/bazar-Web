import { IShop, ShopModel } from "../models/shop.model";
import { CategoryModel } from "../models/category.model";
import { UserModel } from "../models/user.model";

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
        if (!shop) return null;

        const obj: any = shop && typeof (shop as any).toObject === 'function' ? (shop as any).toObject() : JSON.parse(JSON.stringify(shop));
        const rawCatId = obj?.categoryId ? String(obj.categoryId) : null;
        if (rawCatId) {
            const cat = await CategoryModel.findOne({ categoryId: rawCatId });
            obj.categoryId = cat ? { _id: cat._id, name: cat.categoryName } : { _id: null, name: '' };
        } else {
            obj.categoryId = { _id: null, name: '' };
        }

        const rawOwnerId = obj?.ownerId ? String(obj.ownerId) : null;
        if (rawOwnerId) {
            const owner = await UserModel.findById(rawOwnerId);
            obj.ownerId = owner
                ? {
                    _id: owner._id,
                    fullName: owner.fullName,
                    email: owner.email,
                    phoneNumber: owner.phoneNumber,
                    sellerStatus: owner.sellerStatus,
                }
                : { _id: null, fullName: '', email: '', phoneNumber: '', sellerStatus: '' };
        } else {
            obj.ownerId = { _id: null, fullName: '', email: '', phoneNumber: '', sellerStatus: '' };
        }

        return obj as unknown as IShop;
    }

    async getShopByOwnerId(ownerId: string): Promise<IShop | null> {
        const shop = await ShopModel.findOne({ ownerId: ownerId });
        if (!shop) return null;

        const obj: any = shop && typeof (shop as any).toObject === 'function' ? (shop as any).toObject() : JSON.parse(JSON.stringify(shop));
        const rawCatId = obj?.categoryId ? String(obj.categoryId) : null;
        if (rawCatId) {
            const cat = await CategoryModel.findOne({ categoryId: rawCatId });
            obj.categoryId = cat ? { _id: cat._id, name: cat.categoryName } : { _id: null, name: '' };
        } else {
            obj.categoryId = { _id: null, name: '' };
        }

        const rawOwnerId = obj?.ownerId ? String(obj.ownerId) : null;
        if (rawOwnerId) {
            const owner = await UserModel.findById(rawOwnerId);
            obj.ownerId = owner
                ? {
                    _id: owner._id,
                    fullName: owner.fullName,
                    email: owner.email,
                    phoneNumber: owner.phoneNumber,
                    sellerStatus: owner.sellerStatus,
                }
                : { _id: null, fullName: '', email: '', phoneNumber: '', sellerStatus: '' };
        } else {
            obj.ownerId = { _id: null, fullName: '', email: '', phoneNumber: '', sellerStatus: '' };
        }

        return obj as unknown as IShop;
    }

    async getAllShops(): Promise<IShop[]> {
        const shops = await ShopModel.find();

        // gather categoryId strings
        const categoryIds = Array.from(
            new Set(
                shops
                    .map((s) => {
                        const v: any = (s as any)?.categoryId;
                        return v ? String(v) : null;
                    })
                    .filter((v): v is string => typeof v === "string" && v.length > 0)
            )
        );

        let categories: any[] = [];
        if (categoryIds.length > 0) {
            categories = await CategoryModel.find({ categoryId: { $in: categoryIds } });
        }

        const categoryMap = new Map<string, any>();
        categories.forEach((c) => categoryMap.set(String(c.categoryId), c));

        const ownerIds = Array.from(
            new Set(
                shops
                    .map((s) => {
                        const v: any = (s as any)?.ownerId;
                        return v ? String(v) : null;
                    })
                    .filter(Boolean)
            )
        );

        let owners: any[] = [];
        if (ownerIds.length > 0) {
            owners = await UserModel.find({ _id: { $in: ownerIds } });
        }

        const ownerMap = new Map<string, any>();
        owners.forEach((o) => ownerMap.set(String(o._id), o));

        // convert shops to plain objects and attach category object when available
        const enriched = shops.map((s) => {
            const obj: any = s && typeof (s as any).toObject === 'function' ? (s as any).toObject() : JSON.parse(JSON.stringify(s));
            const rawCat = obj?.categoryId ? String(obj.categoryId) : null;
            if (rawCat) {
                const cat = categoryMap.get(rawCat);
                obj.categoryId = cat ? { _id: cat._id, name: cat.categoryName } : { _id: null, name: '' };
            } else {
                obj.categoryId = { _id: null, name: '' };
            }

            const rawOwner = obj?.ownerId ? String(obj.ownerId) : null;
            if (rawOwner) {
                const owner = ownerMap.get(rawOwner);
                obj.ownerId = owner
                    ? {
                        _id: owner._id,
                        fullName: owner.fullName,
                        email: owner.email,
                        phoneNumber: owner.phoneNumber,
                        sellerStatus: owner.sellerStatus,
                    }
                    : { _id: null, fullName: '', email: '', phoneNumber: '', sellerStatus: '' };
            } else {
                obj.ownerId = { _id: null, fullName: '', email: '', phoneNumber: '', sellerStatus: '' };
            }
            return obj;
        });

        return enriched as unknown as IShop[];
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