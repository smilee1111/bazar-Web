import { ShopRepository } from "../../repositories/shop.repository";

let shopRepository = new ShopRepository();

export class AdminShopService {
    async getAllShops() {
        const shops = await shopRepository.getAllShops();
        return shops;
    }
}
