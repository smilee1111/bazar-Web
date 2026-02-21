import { ShopRepository } from "../../repositories/shop.repository";
import { ShopPhotoModel } from "../../models/shopPhoto.model";
import { ShopReviewModel } from "../../models/shopReview.model";
import { ShopDetailModel } from "../../models/shopDetail.model";
import { IShop } from "../../models/shop.model";
import { OsrmService } from "../maps/osrm.service";

const shopRepository = new ShopRepository();
const osrmService = new OsrmService();

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
        console.log("Total active shops:", activeShops.length);

        // Ensure all shops have shopId, if not use _id as fallback
        const shopIds = activeShops
            .map((shop: any) => {
                // Ensure shopId is set - if not, use MongoDB _id
                if (!shop?.shopId) {
                    shop.shopId = String(shop?._id || "");
                }
                return shop?.shopId;
            })
            .filter((id: string) => typeof id === "string" && id.length > 0);

        console.log("Shop IDs for lookups:", shopIds);

        if (shopIds.length === 0) {
            return [];
        }

        const [photos, reviews, details] = await Promise.all([
            ShopPhotoModel.find({ shopId: { $in: shopIds }, isActive: true }).lean(),
            ShopReviewModel.find({ shopId: { $in: shopIds }, isActive: true })
                .populate("reviewedBy", "fullName email")
                .lean(),
            ShopDetailModel.find({ shopId: { $in: shopIds } }).lean(),
        ]);

        console.log("Fetched photos:", photos.length, "reviews:", reviews.length, "details:", details.length);

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
        console.log("PublicShopService.getPublicShopById called with id:", id);
        
        // Try direct lookup by shopId or _id
        let shopLookup = await shopRepository.getShopByIdOrShopId(id);
        console.log("Shop lookup result:", shopLookup ? { _id: String(shopLookup._id), shopId: (shopLookup as any).shopId, isActive: (shopLookup as any).isActive } : "null");
        
        // If not found by direct lookup, try to find in the feed
        if (!shopLookup) {
            console.log("Direct lookup failed, trying to find in the public feed...");
            const allPublicShops = await this.getPublicFeed();
            const foundShop = allPublicShops.find((shop: any) => 
                shop.shopId === id || String(shop._id) === id
            );
            if (foundShop) {
                shopLookup = foundShop as IShop;
                console.log("Found shop in public feed");
            }
        }
        
        if (!shopLookup || (shopLookup as any).isActive === false) {
            console.log("Shop not found or inactive");
            return null;
        }

        // Get enriched shop data
        let enrichedShop: IShop | null = shopLookup;
        if (shopLookup._id) {
            enrichedShop = await shopRepository.getShopById(String(shopLookup._id));
            console.log("Enriched shop:", enrichedShop ? { _id: String(enrichedShop._id), shopId: (enrichedShop as any).shopId } : null);
            
            if (!enrichedShop) {
                console.log("Failed to get enriched shop");
                return null;
            }
        }

        const shopId = enrichedShop.shopId || String((enrichedShop as any)._id || "");
        console.log("Resolved shopId:", shopId);
        const [photos, reviews, details] = await Promise.all([
            ShopPhotoModel.find({ shopId, isActive: true }).lean(),
            ShopReviewModel.find({ shopId, isActive: true })
                .populate("reviewedBy", "fullName email")
                .lean(),
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

    async getRouteToShop(shopId: string, fromLat: number, fromLng: number) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop || (shop as any).isActive === false) {
            return null;
        }

        const location = (shop as any).location;
        if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return { error: "Shop location is not available" };
        }

        const [toLng, toLat] = location.coordinates;
        const route = await osrmService.getRoute(fromLng, fromLat, toLng, toLat);

        return {
            shopId: (shop as any).shopId || String((shop as any)._id || ""),
            from: { lat: fromLat, lng: fromLng },
            to: { lat: toLat, lng: toLng },
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
        };
    }
}
