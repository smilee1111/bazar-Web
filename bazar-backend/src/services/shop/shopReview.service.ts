import { CreateShopReviewDto, UpdateShopReviewDto } from "../../dtos/shopReview.dto";
import { HttpError } from "../../errors/http-error";
import { ShopRepository } from "../../repositories/shop.repository";
import { ShopReviewRepository } from "../../repositories/shopReview.repository";
import { FavouriteService } from "../user/favourite.service";
import { ReviewLikeService } from "./reviewLike.service";
import { ReviewDislikeService } from "./reviewDislike.service";

const shopRepository = new ShopRepository();
const shopReviewRepository = new ShopReviewRepository();
const favouriteService = new FavouriteService();
const reviewLikeService = new ReviewLikeService();
const reviewDislikeService = new ReviewDislikeService();

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

        // Prevent shop owner from reviewing their own shop
        const shopOwnerId = typeof shop.ownerId === 'object' && shop.ownerId?._id
            ? shop.ownerId._id.toString()
            : shop.ownerId?.toString();
        
        if (shopOwnerId === userId?.toString()) {
            throw new HttpError(403, "Shop owners cannot review their own shop");
        }

        const { canonicalShopId } = normalizeShopIds(shopId, shop);
        const payload = { ...data, shopId: canonicalShopId, reviewedBy: userId };
        
        // Create the review
        const review = await shopReviewRepository.createReview(payload);
        
        // Auto-add to favourites if not already there
        try {
            await favouriteService.markAsReviewed(userId, canonicalShopId);
        } catch (err) {
            // Silently catch if favourite creation fails (e.g., duplicate)
            console.error('Failed to auto-add favourite for reviewed shop:', err);
        }
        
        return review;
    }

    async getReviewsByShopId(shopId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        const reviews = await shopReviewRepository.getReviewsByShopIds(shopIds);
        return reviews;
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

    async likeReview(reviewId: string, userId: string) {
        return reviewLikeService.likeReview(reviewId, userId);
    }

    async unlikeReview(reviewId: string, userId: string) {
        return reviewLikeService.unlikeReview(reviewId, userId);
    }

    async isReviewLikedByUser(reviewId: string, userId: string): Promise<boolean> {
        return reviewLikeService.isUserLikedReview(reviewId, userId);
    }

    async dislikeReview(reviewId: string, userId: string) {
        return reviewDislikeService.dislikeReview(reviewId, userId);
    }

    async undislikeReview(reviewId: string, userId: string) {
        return reviewDislikeService.undislikeReview(reviewId, userId);
    }

    async isReviewDislikedByUser(reviewId: string, userId: string): Promise<boolean> {
        return reviewDislikeService.isUserDislikedReview(reviewId, userId);
    }

    async getReviewsByUserId(userId: string) {
        return shopReviewRepository.getReviewsByUserId(userId);
    }
}
