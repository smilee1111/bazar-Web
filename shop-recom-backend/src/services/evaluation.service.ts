import { EvaluationRepository, IEvaluationRepository } from "../repositories/evaluation.repository";
import { IRecommendationRepository, RecommendationRepository } from "../repositories/recommendation.repository";
import { RecommendationService } from "./recommendation.service";
import { IUserBehaviour } from "../interactions_userbehaviour/models/userBehaviour.model";
import { IShop } from "../models/shop.model";
import { ndcgAtK, shuffleArray, wilcoxonSignedRank, WilcoxonResult } from "./evaluation/evaluationMetrics.util";

// Reported at K=1, 3, 5 and 10 so the dashboard can show how quality changes as the
// recommendation list grows, rather than just two arbitrarily-chosen cutoffs.
const K_VALUES = [1, 3, 5, 10] as const;
type KValue = typeof K_VALUES[number];

// Significance is only tested at the two headline cutoffs (K=5, K=10) for precision and recall --
// testing at every K/metric combination would multiply the number of hypothesis tests run against
// the same sample and inflate the false-positive rate. With 2 metrics x 2 K x 2 baselines = 8 tests,
// we apply a Bonferroni correction (alpha / 8) alongside the uncorrected p-value.
const SIGNIFICANCE_K_VALUES: KValue[] = [5, 10];
const SIGNIFICANCE_TEST_COUNT = SIGNIFICANCE_K_VALUES.length * 2 /* metrics */ * 2 /* baselines */;
const BONFERRONI_ALPHA = 0.05 / SIGNIFICANCE_TEST_COUNT;

type Variant = "personalized" | "baseline" | "random";
type MetricName = "precision" | "recall" | "ndcg";
const VARIANTS: Variant[] = ["personalized", "baseline", "random"];
const METRICS: MetricName[] = ["precision", "recall", "ndcg"];

type PerUserStore = Record<Variant, Record<MetricName, Record<KValue, number[]>>>;

function createPerUserStore(): PerUserStore {
    const store = {} as PerUserStore;
    VARIANTS.forEach(variant => {
        store[variant] = {} as Record<MetricName, Record<KValue, number[]>>;
        METRICS.forEach(metric => {
            store[variant][metric] = {} as Record<KValue, number[]>;
            K_VALUES.forEach(k => {
                store[variant][metric][k] = [];
            });
        });
    });
    return store;
}

function average(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

// Interceptor repository for evaluating the personalized recommendation engine using Train set only
class EvaluationRecommendationRepository implements IRecommendationRepository {
    private trainLogs: IUserBehaviour[];
    private realRepo: IRecommendationRepository;

    constructor(trainLogs: IUserBehaviour[], realRepo: IRecommendationRepository) {
        this.trainLogs = trainLogs;
        this.realRepo = realRepo;
    }

    async getUserBehaviourHistory(userId: string): Promise<IUserBehaviour[]> {
        return this.trainLogs;
    }

    async getShopsNearLocation(lat: number, lng: number, radiusKm: number): Promise<IShop[]> {
        return this.realRepo.getShopsNearLocation(lat, lng, radiusKm);
    }

    async getUserInteractedShopIds(userId: string): Promise<string[]> {
        // Exclude train-set favorited/saved shops so they are not recommended again
        const ids = new Set<string>();
        this.trainLogs.forEach(log => {
            if ((log.eventType === "favorite" || log.eventType === "save") && log.shopId) {
                ids.add(log.shopId.toString());
            }
        });
        return Array.from(ids);
    }
}

// Interceptor repository for evaluating the non-personalized baseline
class BaselineRecommendationRepository implements IRecommendationRepository {
    private trainLogs: IUserBehaviour[];
    private realRepo: IRecommendationRepository;

    constructor(trainLogs: IUserBehaviour[], realRepo: IRecommendationRepository) {
        this.trainLogs = trainLogs;
        this.realRepo = realRepo;
    }

    async getUserBehaviourHistory(userId: string): Promise<IUserBehaviour[]> {
        return []; // Empty profile -> category weights will be 0
    }

    async getShopsNearLocation(lat: number, lng: number, radiusKm: number): Promise<IShop[]> {
        return this.realRepo.getShopsNearLocation(lat, lng, radiusKm);
    }

    async getUserInteractedShopIds(userId: string): Promise<string[]> {
        // Exclude the same train-set shops so candidate pools remain identical to the personalized ranker
        const ids = new Set<string>();
        this.trainLogs.forEach(log => {
            if ((log.eventType === "favorite" || log.eventType === "save") && log.shopId) {
                ids.add(log.shopId.toString());
            }
        });
        return Array.from(ids);
    }
}

export class EvaluationService {
    private evaluationRepository: IEvaluationRepository;
    private realRecommendationRepository: IRecommendationRepository;

    constructor(
        evaluationRepository: IEvaluationRepository = new EvaluationRepository(),
        realRecommendationRepository: IRecommendationRepository = new RecommendationRepository()
    ) {
        this.evaluationRepository = evaluationRepository;
        this.realRecommendationRepository = realRecommendationRepository;
    }

    private toIdSets(recs: { shop: any }[]): string[][] {
        return recs.map(r => {
            const ids = [r.shop._id.toString()];
            if (r.shop.shopId) ids.push(r.shop.shopId.toString());
            return ids;
        });
    }

    // Floor baseline: shops within radius in random order, so the personalized engine and the
    // geo-only baseline both have something weaker than "distance + popularity" to be measured against.
    private async getRandomBaselineIdSets(lat: number, lng: number, excludeIds: Set<string>, k: number): Promise<string[][]> {
        const nearby = await this.realRecommendationRepository.getShopsNearLocation(lat, lng, 10);
        const candidates = nearby.filter(shop => {
            const idStr = shop._id.toString();
            const shopIdStr = (shop as any).shopId;
            return !excludeIds.has(idStr) && !excludeIds.has(shopIdStr);
        });
        const shuffled = shuffleArray(candidates).slice(0, k);
        return shuffled.map(shop => {
            const ids = [shop._id.toString()];
            if ((shop as any).shopId) ids.push((shop as any).shopId.toString());
            return ids;
        });
    }

    private countHits(idSets: string[][], targets: string[]): number {
        return idSets.filter(ids => ids.some(id => targets.includes(id))).length;
    }

    async runEvaluation(lat: number, lng: number, minLogsCount: number = 5) {
        const userIds = await this.evaluationRepository.getUsersWithMinHistory(minLogsCount);
        const perUser = createPerUserStore();

        let totalUsersEvaluated = 0;

        for (const userId of userIds) {
            const logs = await this.evaluationRepository.getUserLogs(userId);

            // Train/Test split chronologically (70% Train, 30% Test)
            const splitIndex = Math.floor(logs.length * 0.7);
            const trainLogs = logs.slice(0, splitIndex);
            const testLogs = logs.slice(splitIndex);

            // Test targets (Ground Truth): shops the user interacted with in test logs.
            // We include all interaction types (view, favorite, save, search_click) as positive signals
            // because with sparse data, restricting to only favorite/save leaves the test set empty.
            const testTargetShopIds = Array.from(
                new Set(
                    testLogs
                        .filter(log => log.shopId)
                        .map(log => log.shopId!.toString())
                )
            );

            // Skip users without any interactions in test split
            if (testTargetShopIds.length === 0) {
                continue;
            }

            totalUsersEvaluated++;

            // Run Personalized recommendations using only Train logs
            const evalRepo = new EvaluationRecommendationRepository(trainLogs, this.realRecommendationRepository);
            const personalizedService = new RecommendationService(evalRepo);
            const recs = await personalizedService.getRecommendations(userId, lat, lng, 10);
            const recIdSets = this.toIdSets(recs);

            // Run Baseline recommendations (geo + popularity/recency, no personalization)
            const baselineRepo = new BaselineRecommendationRepository(trainLogs, this.realRecommendationRepository);
            const baselineService = new RecommendationService(baselineRepo);
            const baseRecs = await baselineService.getRecommendations(userId, lat, lng, 10);
            const baseIdSets = this.toIdSets(baseRecs);

            // Run the random-within-radius floor baseline, excluding the same train-set shops
            const excludeIds = new Set(await baselineRepo.getUserInteractedShopIds(userId));
            const randomIdSets = await this.getRandomBaselineIdSets(lat, lng, excludeIds, 10);

            const idSetsByVariant: Record<Variant, string[][]> = {
                personalized: recIdSets,
                baseline: baseIdSets,
                random: randomIdSets
            };

            K_VALUES.forEach(k => {
                VARIANTS.forEach(variant => {
                    const idSets = idSetsByVariant[variant];
                    const slice = idSets.slice(0, k);
                    const hits = this.countHits(slice, testTargetShopIds);

                    const precision = slice.length > 0 ? hits / slice.length : 0;
                    const recall = testTargetShopIds.length > 0 ? hits / testTargetShopIds.length : 0;
                    const ndcg = ndcgAtK(idSets, testTargetShopIds, k);

                    perUser[variant].precision[k].push(precision);
                    perUser[variant].recall[k].push(recall);
                    perUser[variant].ndcg[k].push(ndcg);
                });
            });
        }

        const variantResults: Record<Variant, Record<MetricName, Record<KValue, number>>> = {} as any;
        VARIANTS.forEach(variant => {
            variantResults[variant] = {} as Record<MetricName, Record<KValue, number>>;
            METRICS.forEach(metric => {
                variantResults[variant][metric] = {} as Record<KValue, number>;
                K_VALUES.forEach(k => {
                    variantResults[variant][metric][k] = average(perUser[variant][metric][k]);
                });
            });
        });

        const significance: {
            vsBaseline: Record<string, Record<KValue, WilcoxonResult>>;
            vsRandom: Record<string, Record<KValue, WilcoxonResult>>;
        } = { vsBaseline: {}, vsRandom: {} };

        (["precision", "recall"] as MetricName[]).forEach(metric => {
            significance.vsBaseline[metric] = {} as Record<KValue, WilcoxonResult>;
            significance.vsRandom[metric] = {} as Record<KValue, WilcoxonResult>;
            SIGNIFICANCE_K_VALUES.forEach(k => {
                significance.vsBaseline[metric][k] = wilcoxonSignedRank(
                    perUser.personalized[metric][k],
                    perUser.baseline[metric][k],
                    BONFERRONI_ALPHA
                );
                significance.vsRandom[metric][k] = wilcoxonSignedRank(
                    perUser.personalized[metric][k],
                    perUser.random[metric][k],
                    BONFERRONI_ALPHA
                );
            });
        });

        return {
            totalUsersWithHistory: userIds.length,
            totalUsersEvaluated,
            minLogsCount,
            kValues: K_VALUES,
            variants: variantResults,
            significance: {
                ...significance,
                bonferroniAlpha: BONFERRONI_ALPHA,
                testedAtK: SIGNIFICANCE_K_VALUES
            }
        };
    }
}
