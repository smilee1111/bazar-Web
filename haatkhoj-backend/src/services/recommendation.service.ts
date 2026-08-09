import { IRecommendationRepository, RecommendationRepository } from "../repositories/recommendation.repository";
import { ShopReviewModel } from "../models/shopReview.model";
import { ShopModel } from "../models/shop.model";
import { ShopPhotoModel } from "../models/shopPhoto.model";
import { ShopDetailModel } from "../models/shopDetail.model";

const EVENT_WEIGHTS: Record<string, number> = {
    favorite: 1.0,
    save: 0.8,
    view: 0.3,
    search_click: 0.5,
    search: 0.2
};

export class RecommendationService {
    private recommendationRepository: IRecommendationRepository;

    constructor(recommendationRepository: IRecommendationRepository = new RecommendationRepository()) {
        this.recommendationRepository = recommendationRepository;
    }

    async getRecommendations(userId: string, lat: number, lng: number, k: number = 10) {
        // Step 1: Fetch user interaction history and build interest profile
        const behaviourLogs = await this.recommendationRepository.getUserBehaviourHistory(userId);
        
        const interestProfile: Record<string, number> = {};
        let totalWeightSum = 0;

        if (behaviourLogs.length > 0) {
            // Collect unique shopIds from logs to fetch their categories
            const shopIds = Array.from(
                new Set(behaviourLogs.map(log => log.shopId?.toString()).filter(Boolean))
            );

            // Fetch shops to build a map of shopId -> categoryId
            const shopsForCategories = await ShopModel.find({
                $or: [
                    { _id: { $in: shopIds as any[] } },
                    { shopId: { $in: shopIds as any[] } }
                ]
            }).select("_id shopId categoryId").lean();

            const shopCategoryMap = new Map<string, string>();
            shopsForCategories.forEach(s => {
                if ((s as any).categoryId) {
                    const catStr = (s as any).categoryId.toString();
                    shopCategoryMap.set(s._id.toString(), catStr);
                    if ((s as any).shopId) {
                        shopCategoryMap.set((s as any).shopId.toString(), catStr);
                    }
                }
            });

            // Sum up weights per category
            behaviourLogs.forEach(log => {
                if (!log.shopId) return;
                const catId = shopCategoryMap.get(log.shopId.toString());
                if (!catId) return;

                const weight = EVENT_WEIGHTS[log.eventType] || 0.2;
                interestProfile[catId] = (interestProfile[catId] || 0) + weight;
                totalWeightSum += weight;
            });

            // Normalize interest profile weights
            if (totalWeightSum > 0) {
                for (const catId in interestProfile) {
                    interestProfile[catId] = interestProfile[catId] / totalWeightSum;
                }
            }
        }

        // Step 2: Candidates retrieval within radius (default 10km) and filter out interacted shops
        const radiusKm = 10;
        const [nearbyShops, interactedShopIds] = await Promise.all([
            this.recommendationRepository.getShopsNearLocation(lat, lng, radiusKm),
            this.recommendationRepository.getUserInteractedShopIds(userId)
        ]);

        const interactedSet = new Set(interactedShopIds);
        const candidates = nearbyShops.filter(shop => {
            const idStr = shop._id.toString();
            const shopIdStr = shop.shopId;
            return !interactedSet.has(idStr) && !interactedSet.has(shopIdStr);
        });

        if (candidates.length === 0) {
            return [];
        }

        // Step 3: Popularity score calculations
        // Query reviews for all candidates to compute reviewCount and avgRating
        const candidateIds = candidates.map(shop => shop._id ? shop._id.toString() : "");
        const candidateShopIds = candidates.map(shop => shop.shopId ? shop.shopId.toString() : "").filter(Boolean);
        const allQueryIds = Array.from(new Set([...candidateIds, ...candidateShopIds]));

        const [reviews, candidatePhotos] = await Promise.all([
            ShopReviewModel.find({
                shopId: { $in: allQueryIds },
                isActive: true
            }).select("shopId starNum").lean(),
            ShopPhotoModel.find({
                shopId: { $in: allQueryIds },
                isActive: true
            }).select("shopId photoName").lean()
        ]);

        const candidatePhotosByShop = new Set<string>();
        candidatePhotos.forEach((photo: any) => {
            if (photo.shopId) candidatePhotosByShop.add(photo.shopId.toString());
        });

        // Calculate raw popularity: count * avgRating
        const rawPopularities = candidates.map(shop => {
            const idStr = shop._id.toString();
            const shopIdStr = shop.shopId;
            const shopReviews = reviews.filter(r => r.shopId === idStr || r.shopId === shopIdStr);
            const reviewCount = shopReviews.length;
            const avgRating = reviewCount > 0 
                ? shopReviews.reduce((sum, r) => sum + r.starNum, 0) / reviewCount 
                : 0;
            return {
                shopId: idStr,
                raw: reviewCount * avgRating
            };
        });

        const raws = rawPopularities.map(rp => rp.raw);
        const maxRaw = Math.max(...raws, 0);
        const minRaw = Math.min(...raws, 0);
        const rawRange = maxRaw - minRaw;

        const popularityMap = new Map<string, number>();
        rawPopularities.forEach(rp => {
            const normScore = rawRange > 0 ? (rp.raw - minRaw) / rawRange : 0;
            popularityMap.set(rp.shopId, normScore);
        });

        // Step 4: Compute final scores & rank
        const scoredCandidates = candidates.map(shop => {
            const idStr = shop._id.toString();

            // A. Category match weight
            const catId = (shop as any).categoryId?.toString();
            const categoryMatchWeight = (catId && interestProfile[catId]) || 0;

            // B. Popularity score (already normalized)
            const popularityScore = popularityMap.get(idStr) || 0;

            // C. Recency score: 1 if active in last 30 days, decays exponentially after that
            const ageInDays = (Date.now() - new Date(shop.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            let recencyScore = 1.0;
            if (ageInDays > 30) {
                recencyScore = Math.exp(-0.01 * (ageInDays - 30));
            }

            // D. Photo presence score
            const shopIdStr = shop.shopId;
            const hasPhoto = candidatePhotosByShop.has(idStr) || (shopIdStr && candidatePhotosByShop.has(shopIdStr));
            const photoScore = hasPhoto ? 1.0 : 0.0;

            // Weighted scoring function
            const finalScore = (categoryMatchWeight * 0.4) + (popularityScore * 0.3) + (recencyScore * 0.1) + (photoScore * 0.2);

            return {
                shop,
                scores: {
                    categoryMatchWeight,
                    popularityScore,
                    recencyScore,
                    photoScore,
                    finalScore
                }
            };
        });

        // Sort descending by finalScore
        scoredCandidates.sort((a, b) => b.scores.finalScore - a.scores.finalScore);

        // Limit to top K
        const topK = scoredCandidates.slice(0, k);

        // Enrich photos, details, and attach mapped reviews for the top K shops
        const topKIds = new Set<string>();
        topK.forEach(item => {
            if (item.shop._id) topKIds.add(item.shop._id.toString());
            if (item.shop.shopId) topKIds.add(item.shop.shopId.toString());
        });
        const queryIds = Array.from(topKIds);

        const [photos, details] = await Promise.all([
            ShopPhotoModel.find({ shopId: { $in: queryIds }, isActive: true }).lean(),
            ShopDetailModel.find({ shopId: { $in: queryIds } }).lean()
        ]);

        const photosByShop = new Map<string, any[]>();
        photos.forEach((photo: any) => {
            const sId = photo.shopId ? photo.shopId.toString() : "";
            const list = photosByShop.get(sId) || [];
            list.push(photo);
            photosByShop.set(sId, list);
        });

        const detailsByShop = new Map<string, any[]>();
        details.forEach((detail: any) => {
            const sId = detail.shopId ? detail.shopId.toString() : "";
            const list = detailsByShop.get(sId) || [];
            list.push(detail);
            detailsByShop.set(sId, list);
        });

        const enrichedTopK = topK.map(item => {
            const idStr = item.shop._id ? item.shop._id.toString() : "";
            const shopIdStr = item.shop.shopId ? item.shop.shopId.toString() : "";
            const resolvedId = shopIdStr || idStr;

            const shopReviews = reviews.filter(r => {
                const rsId = r.shopId ? r.shopId.toString() : "";
                return rsId === idStr || rsId === shopIdStr;
            });
            const reviewCount = shopReviews.length;
            const avgRating = reviewCount > 0 
                ? shopReviews.reduce((sum, r) => sum + r.starNum, 0) / reviewCount 
                : 0;

            const shopPhotos = [
                ...(shopIdStr ? (photosByShop.get(shopIdStr) || []) : []),
                ...(photosByShop.get(idStr) || [])
            ];

            const shopDetails = [
                ...(shopIdStr ? (detailsByShop.get(shopIdStr) || []) : []),
                ...(detailsByShop.get(idStr) || [])
            ];

            const enrichedShop = {
                ...item.shop,
                shopId: resolvedId,
                photos: shopPhotos,
                reviews: shopReviews,
                details: shopDetails,
                avgRating,
                reviewCount
            };

            return {
                ...item,
                shop: enrichedShop
            };
        });

        return enrichedTopK;
    }
}
