import mongoose from "mongoose";
import { IShop, ShopModel } from "../models/shop.model";
import { CategoryModel } from "../models/category.model";
import { UserModel } from "../models/user.model";

const isObjectIdString = (value: string) => /^[a-f\d]{24}$/i.test(value);

export interface IShopRepository {
    createShop(data: Partial<IShop>): Promise<IShop>;
    getShopById(id: string): Promise<IShop | null>;
    getShopByIdOrShopId(id: string): Promise<IShop | null>;
    getShopByIdRaw(id: string): Promise<IShop | null>;
    getShopByOwnerId(ownerId: string): Promise<IShop | null>;
    getAllShops(): Promise<IShop[]>;
    updateShop(id: string, data: Partial<IShop>): Promise<IShop | null>;
    deleteShop(id: string): Promise<boolean | null>;
    findNearestByCategory(
        categoryId: string,
        userLocation: { lat: number; lng: number },
        limit?: number
    ): Promise<IShop[]>;
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
            const cat = await CategoryModel.findOne(
                isObjectIdString(rawCatId)
                    ? { $or: [{ categoryId: rawCatId }, { _id: rawCatId }] }
                    : { categoryId: rawCatId }
            );
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

    async getShopByIdOrShopId(id: string): Promise<IShop | null> {
        const isObjectId = isObjectIdString(id);
        const shop = await ShopModel.findOne(
            isObjectId
                ? { $or: [{ _id: id }, { shopId: id }] }
                : { shopId: id }
        );
        return shop;
    }

    async getShopByIdRaw(id: string): Promise<IShop | null> {
        const shop = await ShopModel.findById(id);
        return shop;
    }

    async getShopByOwnerId(ownerId: string): Promise<IShop | null> {
        const shop = await ShopModel.findOne({ ownerId: ownerId });
        if (!shop) return null;

        const obj: any = shop && typeof (shop as any).toObject === 'function' ? (shop as any).toObject() : JSON.parse(JSON.stringify(shop));
        const rawCatId = obj?.categoryId ? String(obj.categoryId) : null;
        if (rawCatId) {
            const cat = await CategoryModel.findOne(
                isObjectIdString(rawCatId)
                    ? { $or: [{ categoryId: rawCatId }, { _id: rawCatId }] }
                    : { categoryId: rawCatId }
            );
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
            const objectIdCandidates = categoryIds.filter((id) => isObjectIdString(id));
            categories = await CategoryModel.find({
                $or: [
                    { categoryId: { $in: categoryIds } },
                    { _id: { $in: objectIdCandidates } },
                ],
            });
        }

        const categoryByIdMap = new Map<string, any>();
        const categoryByObjectIdMap = new Map<string, any>();
        categories.forEach((c) => {
            categoryByIdMap.set(String(c.categoryId), c);
            categoryByObjectIdMap.set(String(c._id), c);
        });

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
                const cat = categoryByIdMap.get(rawCat) || categoryByObjectIdMap.get(rawCat);
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

    async findNearestByCategory(
        categoryId: string,
        userLocation: { lat: number; lng: number },
        limit = 10
    ): Promise<IShop[]> {
        try {
            // First, resolve the category ID - the input could be either _id or categoryId
            let category = await CategoryModel.findOne({
                $or: [
                    { _id: categoryId },
                    { categoryId: categoryId },
                    { _id: new mongoose.Types.ObjectId(categoryId) }
                ]
            }).lean();

            if (!category) {
                console.log(`[findNearestByCategory] Category not found for input: ${categoryId}`);
                return [];
            }

            // Use the category's categoryId field for shop lookup
            const actualCategoryId = category.categoryId || String(category._id);
            
            // Get shops within the distance limit, ordered by distance
            const shops = await ShopModel.find({
                categoryId: actualCategoryId,
                isActive: true,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [userLocation.lng, userLocation.lat],
                        },
                        $maxDistance: 7000 // 7km straight-line (roughly 10km road distance)
                    }
                }
            })
            .limit(limit)
            .lean();

            // Calculate and log actual distances for debugging
            console.log(`[findNearestByCategory] User location: [${userLocation.lng}, ${userLocation.lat}]`);
            shops.forEach((shop: any) => {
                if (shop.location && shop.location.coordinates) {
                    const shopLng = shop.location.coordinates[0];
                    const shopLat = shop.location.coordinates[1];
                    const distance = this.calculateDistance(
                        userLocation.lat, 
                        userLocation.lng,
                        shopLat, 
                        shopLng
                    );
                    console.log(`[findNearestByCategory] Shop: ${shop.name || shop.shopId}`);
                    console.log(`  - Coordinates: [${shopLng}, ${shopLat}]`);
                    console.log(`  - Distance: ${distance.toFixed(2)} km`);
                }
            });

            return shops as IShop[];
        } catch (error) {
            console.error(`[findNearestByCategory] Error:`, error);
            throw error;
        }
    }

    // Helper method to calculate distance using Haversine formula
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}