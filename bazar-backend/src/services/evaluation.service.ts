import { EvaluationRepository, IEvaluationRepository } from "../repositories/evaluation.repository";
import { IRecommendationRepository, RecommendationRepository } from "../repositories/recommendation.repository";
import { RecommendationService } from "./recommendation.service";
import { IUserBehaviour } from "../interactions_userbehaviour/models/userBehaviour.model";
import { IShop } from "../models/shop.model";

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

    private calculateMetrics(recommendations: string[], targets: string[]) {
        if (targets.length === 0) return { precision: 0, recall: 0 };
        const hits = recommendations.filter(id => targets.includes(id)).length;
        const precision = recommendations.length > 0 ? hits / recommendations.length : 0;
        const recall = hits / targets.length;
        return { precision, recall };
    }

    async runEvaluation(lat: number, lng: number, minLogsCount: number = 5) {
        const userIds = await this.evaluationRepository.getUsersWithMinHistory(minLogsCount);
        
        let totalUsersEvaluated = 0;
        let sumPersPrecisionAt5 = 0;
        let sumPersRecallAt5 = 0;
        let sumPersPrecisionAt10 = 0;
        let sumPersRecallAt10 = 0;

        let sumBasePrecisionAt5 = 0;
        let sumBaseRecallAt5 = 0;
        let sumBasePrecisionAt10 = 0;
        let sumBaseRecallAt10 = 0;

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
            // Build ID sets per recommendation so we can match behaviour logs that use either _id or shopId
            const recIdSets = recs.map(r => {
                const ids = [r.shop._id.toString()];
                if ((r.shop as any).shopId) ids.push((r.shop as any).shopId.toString());
                return ids;
            });

            // Run Baseline recommendations
            const baselineRepo = new BaselineRecommendationRepository(trainLogs, this.realRecommendationRepository);
            const baselineService = new RecommendationService(baselineRepo);
            const baseRecs = await baselineService.getRecommendations(userId, lat, lng, 10);
            const baseIdSets = baseRecs.map(r => {
                const ids = [r.shop._id.toString()];
                if ((r.shop as any).shopId) ids.push((r.shop as any).shopId.toString());
                return ids;
            });

            // Helper: count how many recommendation slots have at least one ID matching a target
            const countHits = (idSets: string[][], targets: string[]) =>
                idSets.filter(ids => ids.some(id => targets.includes(id))).length;

            // Compute metrics
            const persHitsAt5 = countHits(recIdSets.slice(0, 5), testTargetShopIds);
            const persHitsAt10 = countHits(recIdSets.slice(0, 10), testTargetShopIds);
            const baseHitsAt5 = countHits(baseIdSets.slice(0, 5), testTargetShopIds);
            const baseHitsAt10 = countHits(baseIdSets.slice(0, 10), testTargetShopIds);

            const persAt5 = { precision: recIdSets.length >= 5 ? persHitsAt5 / 5 : (recIdSets.length > 0 ? persHitsAt5 / recIdSets.length : 0), recall: testTargetShopIds.length > 0 ? persHitsAt5 / testTargetShopIds.length : 0 };
            const persAt10 = { precision: recIdSets.length >= 10 ? persHitsAt10 / 10 : (recIdSets.length > 0 ? persHitsAt10 / recIdSets.length : 0), recall: testTargetShopIds.length > 0 ? persHitsAt10 / testTargetShopIds.length : 0 };
            const baseAt5 = { precision: baseIdSets.length >= 5 ? baseHitsAt5 / 5 : (baseIdSets.length > 0 ? baseHitsAt5 / baseIdSets.length : 0), recall: testTargetShopIds.length > 0 ? baseHitsAt5 / testTargetShopIds.length : 0 };
            const baseAt10 = { precision: baseIdSets.length >= 10 ? baseHitsAt10 / 10 : (baseIdSets.length > 0 ? baseHitsAt10 / baseIdSets.length : 0), recall: testTargetShopIds.length > 0 ? baseHitsAt10 / testTargetShopIds.length : 0 };

            // Aggregate
            sumPersPrecisionAt5 += persAt5.precision;
            sumPersRecallAt5 += persAt5.recall;
            sumPersPrecisionAt10 += persAt10.precision;
            sumPersRecallAt10 += persAt10.recall;

            sumBasePrecisionAt5 += baseAt5.precision;
            sumBaseRecallAt5 += baseAt5.recall;
            sumBasePrecisionAt10 += baseAt10.precision;
            sumBaseRecallAt10 += baseAt10.recall;
        }

        return {
            totalUsersWithHistory: userIds.length,
            totalUsersEvaluated,
            personalized: {
                precisionAt5: totalUsersEvaluated > 0 ? sumPersPrecisionAt5 / totalUsersEvaluated : 0,
                recallAt5: totalUsersEvaluated > 0 ? sumPersRecallAt5 / totalUsersEvaluated : 0,
                precisionAt10: totalUsersEvaluated > 0 ? sumPersPrecisionAt10 / totalUsersEvaluated : 0,
                recallAt10: totalUsersEvaluated > 0 ? sumPersRecallAt10 / totalUsersEvaluated : 0
            },
            baseline: {
                precisionAt5: totalUsersEvaluated > 0 ? sumBasePrecisionAt5 / totalUsersEvaluated : 0,
                recallAt5: totalUsersEvaluated > 0 ? sumBaseRecallAt5 / totalUsersEvaluated : 0,
                precisionAt10: totalUsersEvaluated > 0 ? sumBasePrecisionAt10 / totalUsersEvaluated : 0,
                recallAt10: totalUsersEvaluated > 0 ? sumBaseRecallAt10 / totalUsersEvaluated : 0
            }
        };
    }
}
