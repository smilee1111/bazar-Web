import { ShopRepository } from "../../repositories/shop.repository";
import { CreateShopDto, UpdateShopDto } from "../../dtos/shop.dto";
import { HttpError } from "../../errors/http-error";

let shopRepository = new ShopRepository();

export class AdminShopService {
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

    async createShop(data: CreateShopDto) {
        const newShop = await shopRepository.createShop(data);
        return newShop;
    }

    async updateShop(id: string, data: UpdateShopDto) {
        const existing = await shopRepository.getShopById(id);
        if (!existing) {
            throw new HttpError(404, "Shop not found");
        }
        const updatedShop = await shopRepository.updateShop(id, data);
        return updatedShop;
    }

    async deleteShop(id: string) {
        const existing = await shopRepository.getShopById(id);
        if (!existing) {
            throw new HttpError(404, "Shop not found");
        }
        const result = await shopRepository.deleteShop(id);
        return result;
    }
}
