import { ShopRepository } from "../../repositories/shop.repository";
import { ShopPhotoModel } from "../../models/shopPhoto.model";
import { ShopReviewModel } from "../../models/shopReview.model";
import { ShopDetailModel } from "../../models/shopDetail.model";

const shopRepository = new ShopRepository();

const mapReview = (review: any) => ({
    ...review,
    reviewText: review.reviewText || review.reviewName || "",
    likes: typeof review.likes === "number" ? review.likes : (review.likesCount ?? 0),
    dislikes: typeof review.dislikes === "number" ? review.dislikes : (review.dislikeCount ?? 0),
});

export class PublicShopService {
    async getPublicFeed() {
        const shops = await shopRepository.getAllShops();
        const activeShops = shops.filter((shop: any) => shop?.isActive !== false);

        const shopIds = activeShops
            .map((shop: any) => shop?.shopId || String(shop?._id || ""))
            .filter((id: string) => typeof id === "string" && id.length > 0);

        if (shopIds.length === 0) {
            return [];
        }

        const [photos, reviews, details] = await Promise.all([
            ShopPhotoModel.find({ shopId: { $in: shopIds }, isActive: true }).lean(),
            ShopReviewModel.find({ shopId: { $in: shopIds }, isActive: true }).lean(),
            ShopDetailModel.find({ shopId: { $in: shopIds } }).lean(),
        ]);

        const photosByShop = new Map<string, any[]>();
        photos.forEach((photo: any) => {
            const list = photosByShop.get(photo.shopId) || [];
            list.push(photo);
            photosByShop.set(photo.shopId, list);
        });

        const reviewsByShop = new Map<string, any[]>();
        reviews.forEach((review: any) => {
            const list = reviewsByShop.get(review.shopId) || [];
            list.push(mapReview(review));
            reviewsByShop.set(review.shopId, list);
        });

        const detailsByShop = new Map<string, any[]>();
        details.forEach((detail: any) => {
            const list = detailsByShop.get(detail.shopId) || [];
            list.push(detail);
            detailsByShop.set(detail.shopId, list);
        });

        return activeShops.map((shop: any) => {
            const resolvedShopId = shop?.shopId || String(shop?._id || "");
            const reviewsForShop = reviewsByShop.get(resolvedShopId) || [];
            const avgRating = reviewsForShop.length > 0
                ? reviewsForShop.reduce((sum, r) => sum + (r.starNum || 0), 0) / reviewsForShop.length
                : 0;

            return {
                ...shop,
                shopId: resolvedShopId,
                contactNumber: shop.contactNumber || shop.shopContact,
                photos: photosByShop.get(resolvedShopId) || [],
                reviews: reviewsForShop,
                details: detailsByShop.get(resolvedShopId) || [],
                avgRating,
                reviewCount: reviewsForShop.length,
            };
        });
    }

    async getPublicShopById(id: string) {
        const shopLookup = await shopRepository.getShopByIdOrShopId(id);
        if (!shopLookup || shopLookup.isActive === false) {
            return null;
        }

        const enrichedShop = await shopRepository.getShopById(String(shopLookup._id));
        if (!enrichedShop) {
            return null;
        }

        const shopId = enrichedShop.shopId || String((enrichedShop as any)._id || "");
        const [photos, reviews, details] = await Promise.all([
            ShopPhotoModel.find({ shopId, isActive: true }).lean(),
            ShopReviewModel.find({ shopId, isActive: true }).lean(),
            ShopDetailModel.find({ shopId }).lean(),
        ]);

        const mappedReviews = reviews.map(mapReview);
        const avgRating = mappedReviews.length > 0
            ? mappedReviews.reduce((sum, r) => sum + (r.starNum || 0), 0) / mappedReviews.length
            : 0;

        return {
            ...enrichedShop,
            shopId,
            contactNumber: (enrichedShop as any).contactNumber || (enrichedShop as any).shopContact,
            photos,
            reviews: mappedReviews,
            details,
            avgRating,
            reviewCount: mappedReviews.length,
        };
    }
}
