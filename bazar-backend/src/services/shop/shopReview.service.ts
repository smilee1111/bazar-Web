import { CreateShopReviewDto, UpdateShopReviewDto } from "../../dtos/shopReview.dto";
import { HttpError } from "../../errors/http-error";
import { ShopRepository } from "../../repositories/shop.repository";
import { ShopReviewRepository } from "../../repositories/shopReview.repository";

const shopRepository = new ShopRepository();
const shopReviewRepository = new ShopReviewRepository();

const normalizeShopIds = (shopId: string, resolvedShop: { shopId?: string; _id?: { toString(): string } }) => {
    const ids = new Set<string>();
    if (shopId) ids.add(String(shopId));
    if (resolvedShop.shopId) ids.add(String(resolvedShop.shopId));
    if (resolvedShop._id) ids.add(resolvedShop._id.toString());
    const canonicalShopId = resolvedShop.shopId ? String(resolvedShop.shopId) : resolvedShop._id?.toString() || String(shopId);
    return { shopIds: Array.from(ids), canonicalShopId };
};

export class ShopReviewService {
    async createReview(shopId: string, userId: string, data: CreateShopReviewDto) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const { canonicalShopId } = normalizeShopIds(shopId, shop);
        const payload = { ...data, shopId: canonicalShopId, reviewedBy: userId };
        return shopReviewRepository.createReview(payload);
    }

    async getReviewsByShopId(shopId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        return shopReviewRepository.getReviewsByShopIds(shopIds);
    }

    async getReviewById(shopId: string, reviewId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review || !shopIds.includes(String(review.shopId)) || review.isActive === false) {
            throw new HttpError(404, "Shop review not found");
        }
        return review;
    }

    async updateReview(shopId: string, reviewId: string, userId: string, data: UpdateShopReviewDto) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        const existing = await shopReviewRepository.getReviewById(reviewId);
        if (!existing || !shopIds.includes(String(existing.shopId))) {
            throw new HttpError(404, "Shop review not found");
        }

        // Handle both populated and non-populated reviewedBy field
        const reviewerId = typeof existing.reviewedBy === 'object' && existing.reviewedBy?._id
            ? existing.reviewedBy._id.toString()
            : existing.reviewedBy?.toString();
        if (!reviewerId || reviewerId !== userId?.toString()) {
            throw new HttpError(403, "Not authorized to update this review");
        }

        const updated = await shopReviewRepository.updateReview(reviewId, data);
        return updated;
    }

    async deleteReview(shopId: string, reviewId: string, userId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        const existing = await shopReviewRepository.getReviewById(reviewId);
        if (!existing || !shopIds.includes(String(existing.shopId))) {
            throw new HttpError(404, "Shop review not found");
        }

        // Handle both populated and non-populated reviewedBy field
        const reviewerId = typeof existing.reviewedBy === 'object' && existing.reviewedBy?._id
            ? existing.reviewedBy._id.toString()
            : existing.reviewedBy?.toString();
        if (!reviewerId || reviewerId !== userId?.toString()) {
            throw new HttpError(403, "Not authorized to delete this review");
        }

        return shopReviewRepository.deleteReview(reviewId);
    }

    async likeReview(reviewId: string) {
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        const currentLikes = review.likesCount || 0;
        const updated = await shopReviewRepository.updateReview(reviewId, {
            likesCount: currentLikes + 1
        } as any);
        
        return updated;
    }

    async dislikeReview(reviewId: string) {
        const review = await shopReviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        const currentDislikes = review.dislikeCount || 0;
        const updated = await shopReviewRepository.updateReview(reviewId, {
            dislikeCount: currentDislikes + 1
        } as any);
        
        return updated;
    }
}
