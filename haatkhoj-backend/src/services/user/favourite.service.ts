import { FavouriteRepository } from "../../repositories/favourite.repository";

const repo = new FavouriteRepository();

export class FavouriteService {
    async addFavourite(userId: string, shopId: string, isReviewed: boolean = false) {
        return repo.addFavourite(userId, shopId, isReviewed);
    }

    async removeFavourite(userId: string, shopId: string) {
        return repo.removeFavourite(userId, shopId);
    }

    async listFavourites(userId: string) {
        return repo.getFavouritesByUser(userId);
    }

    async markAsReviewed(userId: string, shopId: string) {
        return repo.markAsReviewed(userId, shopId);
    }
}
