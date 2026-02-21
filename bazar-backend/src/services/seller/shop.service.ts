import { ShopRepository } from "../../repositories/shop.repository";
import { UserRepository } from "../../repositories/user.repository";
import { CreateShopDto, UpdateShopDto } from "../../dtos/shop.dto";
import { HttpError } from "../../errors/http-error";
import { NotificationHelperService } from "../user/notificationHelper.service";

let shopRepository = new ShopRepository();
let userRepository = new UserRepository();
const notificationHelper = new NotificationHelperService();

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
        
        // Notify all users about the new shop (async, don't wait)
        try {
            const shopIdForNotification = newShop.shopId || newShop._id?.toString() || '';
            notificationHelper.notifyNewShop(
                shopIdForNotification,
                data.shopName,
                ownerId
            ).catch(err => {
                console.error('Failed to send new shop notifications:', err);
            });
        } catch (error) {
            console.error('Error initiating new shop notifications:', error);
            // Don't fail shop creation if notification fails
        }
        
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
        const rawShop = await shopRepository.getShopByIdRaw(id);
        if (!rawShop) {
            throw new HttpError(404, "Shop not found");
        }

        const ownerIdString = ownerId?.toString();
        const shopOwnerId = rawShop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerIdString) {
            throw new HttpError(403, "Not authorized to update this shop");
        }

        const updatedShop = await shopRepository.updateShop(id, data);
        return updatedShop;
    }

    async deleteShop(id: string, ownerId: string) {
        const rawShop = await shopRepository.getShopByIdRaw(id);
        if (!rawShop) {
            throw new HttpError(404, "Shop not found");
        }

        const ownerIdString = ownerId?.toString();
        const shopOwnerId = rawShop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerIdString) {
            throw new HttpError(403, "Not authorized to delete this shop");
        }

        const result = await shopRepository.deleteShop(id);
        return result;
    }
}