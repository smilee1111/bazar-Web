import { SavedShopRepository } from "../../repositories/savedShop.repository";

const repo = new SavedShopRepository();

export class SavedShopService {
    async saveShop(userId: string, shopId: string) {
        return repo.addSavedShop(userId, shopId);
    }

    async removeSavedShop(userId: string, shopId: string) {
        return repo.removeSavedShop(userId, shopId);
    }

    async listSavedShops(userId: string) {
        return repo.getSavedShopsByUser(userId);
    }
}
