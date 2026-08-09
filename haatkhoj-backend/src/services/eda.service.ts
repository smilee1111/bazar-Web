import { EdaRepository, IEdaRepository, ShopSummary } from "../repositories/eda.repository";
import { nearestCity } from "../utils/nepalCities";

const INTERACTION_HISTOGRAM_BUCKETS: Array<{ label: string; min: number; max: number }> = [
    { label: "1-4", min: 1, max: 4 },
    { label: "5-9", min: 5, max: 9 },
    { label: "10-19", min: 10, max: 19 },
    { label: "20+", min: 20, max: Infinity }
];

const DAILY_TREND_WINDOW_DAYS = 30;

function bucketFor(count: number): string {
    const bucket = INTERACTION_HISTOGRAM_BUCKETS.find(b => count >= b.min && count <= b.max);
    return bucket ? bucket.label : INTERACTION_HISTOGRAM_BUCKETS[INTERACTION_HISTOGRAM_BUCKETS.length - 1].label;
}

function resolveShopId(shop: ShopSummary): string {
    return shop.shopId || shop._id;
}

export class EdaService {
    private repository: IEdaRepository;

    constructor(repository: IEdaRepository = new EdaRepository()) {
        this.repository = repository;
    }

    async getDatasetOverview() {
        const [shops, categoryNames, shopIdsWithPhotos, shopIdsWithWebsite, shopIdsWithReviews] = await Promise.all([
            this.repository.getAllShopsSummary(),
            this.repository.getCategoryNames(),
            this.repository.getShopIdsWithPhotos(),
            this.repository.getShopIdsWithWebsite(),
            this.repository.getShopIdsWithReviews()
        ]);

        // Shops by source
        const bySourceCount = new Map<string, number>();
        shops.forEach(s => bySourceCount.set(s.source, (bySourceCount.get(s.source) || 0) + 1));
        const shopsBySource = Array.from(bySourceCount.entries())
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count);

        // Shops by category, broken down per source
        const categoryMap = new Map<string, { categoryName: string; bySource: Record<string, number>; total: number }>();
        shops.forEach(s => {
            const catKey = s.categoryId || "uncategorized";
            const catName = (s.categoryId && categoryNames.get(s.categoryId)) || "Uncategorized";
            if (!categoryMap.has(catKey)) {
                categoryMap.set(catKey, { categoryName: catName, bySource: {}, total: 0 });
            }
            const entry = categoryMap.get(catKey)!;
            entry.bySource[s.source] = (entry.bySource[s.source] || 0) + 1;
            entry.total += 1;
        });
        const shopsByCategory = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);

        // Shops by nearest known city
        const byCityCount = new Map<string, number>();
        shops.forEach(s => {
            if (!s.coordinates || s.coordinates.length !== 2) return;
            const [lng, lat] = s.coordinates;
            const city = nearestCity(lng, lat);
            byCityCount.set(city, (byCityCount.get(city) || 0) + 1);
        });
        const shopsByCity = Array.from(byCityCount.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count);

        // Completeness per source: % of shops with a photo / description / website / review
        const bySourceShops = new Map<string, ShopSummary[]>();
        shops.forEach(s => {
            if (!bySourceShops.has(s.source)) bySourceShops.set(s.source, []);
            bySourceShops.get(s.source)!.push(s);
        });
        const completenessBySource = Array.from(bySourceShops.entries()).map(([source, sourceShops]) => {
            const total = sourceShops.length;
            const withPhoto = sourceShops.filter(s => shopIdsWithPhotos.has(resolveShopId(s))).length;
            const withDescription = sourceShops.filter(s => s.hasDescription).length;
            const withWebsite = sourceShops.filter(s => shopIdsWithWebsite.has(resolveShopId(s))).length;
            const withReview = sourceShops.filter(s => shopIdsWithReviews.has(resolveShopId(s))).length;

            return {
                source,
                totalShops: total,
                withPhotoPct: total > 0 ? withPhoto / total : 0,
                withDescriptionPct: total > 0 ? withDescription / total : 0,
                withWebsitePct: total > 0 ? withWebsite / total : 0,
                withReviewPct: total > 0 ? withReview / total : 0
            };
        }).sort((a, b) => b.totalShops - a.totalShops);

        return {
            totalShops: shops.length,
            shopsBySource,
            shopsByCategory,
            shopsByCity,
            completenessBySource
        };
    }

    async getInteractionOverview() {
        const [eventCounts, perUserCounts, dailyCounts] = await Promise.all([
            this.repository.getBehaviourEventCounts(),
            this.repository.getInteractionsPerUser(),
            this.repository.getDailyInteractionCounts(DAILY_TREND_WINDOW_DAYS)
        ]);

        const totalEvents = eventCounts.reduce((sum, e) => sum + e.count, 0);
        const activeUsers = perUserCounts.length;

        const histogramCounts = new Map<string, number>(INTERACTION_HISTOGRAM_BUCKETS.map(b => [b.label, 0]));
        perUserCounts.forEach(count => {
            const bucket = bucketFor(count);
            histogramCounts.set(bucket, (histogramCounts.get(bucket) || 0) + 1);
        });
        const perUserHistogram = INTERACTION_HISTOGRAM_BUCKETS.map(b => ({
            bucket: b.label,
            userCount: histogramCounts.get(b.label) || 0
        }));

        // Fill in zero-count days so the trend line has no misleading gaps
        const dailyMap = new Map(dailyCounts.map(d => [d.date, d.count]));
        const dailyTrend: Array<{ date: string; count: number }> = [];
        for (let i = DAILY_TREND_WINDOW_DAYS - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            dailyTrend.push({ date, count: dailyMap.get(date) || 0 });
        }

        return {
            totalEvents,
            activeUsers,
            byEventType: eventCounts.sort((a, b) => b.count - a.count),
            perUserHistogram,
            dailyTrend
        };
    }
}
