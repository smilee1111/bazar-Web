import { FavouriteRepository } from "../../repositories/favourite.repository";

const repo = new FavouriteRepository();

export class FavouriteService {
    async addFavourite(userId: string, shopId: string) {
        return repo.addFavourite(userId, shopId);
    }

    async removeFavourite(userId: string, shopId: string) {
        return repo.removeFavourite(userId, shopId);
    }

    async listFavourites(userId: string) {
        return repo.getFavouritesByUser(userId);
    }
}
