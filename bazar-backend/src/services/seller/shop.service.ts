import { ShopRepository } from "../../repositories/shop.repository";
import { UserRepository } from "../../repositories/user.repository";
import { CreateShopDto, UpdateShopDto } from "../../dtos/shop.dto";
import { HttpError } from "../../errors/http-error";

let shopRepository = new ShopRepository();
let userRepository = new UserRepository();

export class SellerShopService {
    async createShop(ownerId: string, data: CreateShopDto) {
        // Check if user is approved seller
        const user = await userRepository.getUserById(ownerId);
        if (!user || user.sellerStatus !== 'approved') {
            throw new HttpError(403, "User is not an approved seller");
        }

        // Check if user already has a shop
        const existingShop = await shopRepository.getShopByOwnerId(ownerId);
        if (existingShop) {
            throw new HttpError(400, "User already has a shop");
        }

        const shopData = { ...data, ownerId };
        const newShop = await shopRepository.createShop(shopData);
        return newShop;
    }

    async getAllShops() {
        const shops = await shopRepository.getAllShops();
        return shops;
    }

    async getShopById(id: string) {
        const shop = await shopRepository.getShopById(id);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        return shop;
    }

    async getShopByOwnerId(ownerId: string) {
        const shop = await shopRepository.getShopByOwnerId(ownerId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        return shop;
    }

    async updateShop(id: string, ownerId: string, data: UpdateShopDto) {
        const shop = await shopRepository.getShopById(id);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        if (shop.ownerId.toString() !== ownerId) {
            throw new HttpError(403, "Not authorized to update this shop");
        }

        const updatedShop = await shopRepository.updateShop(id, data);
        return updatedShop;
    }

    async deleteShop(id: string, ownerId: string) {
        const shop = await shopRepository.getShopById(id);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        if (shop.ownerId.toString() !== ownerId) {
            throw new HttpError(403, "Not authorized to delete this shop");
        }

        const result = await shopRepository.deleteShop(id);
        return result;
    }
}