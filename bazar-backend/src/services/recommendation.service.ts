import { IRecommendationRepository, RecommendationRepository } from "../repositories/recommendation.repository";
import { ShopReviewModel } from "../models/shopReview.model";
import { ShopModel } from "../models/shop.model";

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
                _id: { $in: shopIds as any[] }
            }).select("_id categoryId").lean();

            const shopCategoryMap = new Map<string, string>();
            shopsForCategories.forEach(s => {
                if ((s as any).categoryId) {
                    shopCategoryMap.set(s._id.toString(), (s as any).categoryId.toString());
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
        const candidateIds = candidates.map(shop => shop._id.toString());
        const candidateShopIds = candidates.map(shop => shop.shopId).filter(Boolean);
        const allQueryIds = Array.from(new Set([...candidateIds, ...candidateShopIds]));

        const reviews = await ShopReviewModel.find({
            shopId: { $in: allQueryIds },
            isActive: true
        }).select("shopId starNum").lean();

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

            // Weighted scoring function
            const finalScore = (categoryMatchWeight * 0.5) + (popularityScore * 0.3) + (recencyScore * 0.2);

            return {
                shop,
                scores: {
                    categoryMatchWeight,
                    popularityScore,
                    recencyScore,
                    finalScore
                }
            };
        });

        // Sort descending by finalScore
        scoredCandidates.sort((a, b) => b.scores.finalScore - a.scores.finalScore);

        // Limit to top K
        return scoredCandidates.slice(0, k);
    }
}
