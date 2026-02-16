import { HttpError } from "../../errors/http-error";
import { ShopReviewRepository } from "../../repositories/shopReview.repository";

const shopReviewRepository = new ShopReviewRepository();

export class AdminShopReviewService {
    async getReviewsByShopId(shopId: string) {
        if (!shopId) {
            throw new HttpError(400, "Shop ID is required");
        }
        const reviews = await shopReviewRepository.getReviewsByShopIds([shopId]);
        return reviews;
    }

    async disableReview(reviewId: string) {
        const existing = await shopReviewRepository.getReviewById(reviewId);
        if (!existing) {
            throw new HttpError(404, "Shop review not found");
        }
        const updated = await shopReviewRepository.updateReview(reviewId, { isActive: false });
        return updated;
    }

    async deleteReview(reviewId: string) {
        const existing = await shopReviewRepository.getReviewById(reviewId);
        if (!existing) {
            throw new HttpError(404, "Shop review not found");
        }
        const result = await shopReviewRepository.deleteReview(reviewId);
        return result;
    }
}
