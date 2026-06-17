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

            // Test targets (Ground Truth): shops favorited or saved in test logs
            const testTargetShopIds = Array.from(
                new Set(
                    testLogs
                        .filter(log => (log.eventType === "favorite" || log.eventType === "save") && log.shopId)
                        .map(log => log.shopId!.toString())
                )
            );

            // Skip users without any positive targets in test split
            if (testTargetShopIds.length === 0) {
                continue;
            }

            totalUsersEvaluated++;

            // Run Personalized recommendations using only Train logs
            const evalRepo = new EvaluationRecommendationRepository(trainLogs, this.realRecommendationRepository);
            const personalizedService = new RecommendationService(evalRepo);
            const recs = await personalizedService.getRecommendations(userId, lat, lng, 10);
            const recShopIds = recs.map(r => r.shop._id.toString());
            const recsAt5 = recShopIds.slice(0, 5);
            const recsAt10 = recShopIds.slice(0, 10);

            // Run Baseline recommendations
            const baselineRepo = new BaselineRecommendationRepository(trainLogs, this.realRecommendationRepository);
            const baselineService = new RecommendationService(baselineRepo);
            const baseRecs = await baselineService.getRecommendations(userId, lat, lng, 10);
            const baseShopIds = baseRecs.map(r => r.shop._id.toString());
            const baseRecsAt5 = baseShopIds.slice(0, 5);
            const baseRecsAt10 = baseShopIds.slice(0, 10);

            // Compute metrics
            const persAt5 = this.calculateMetrics(recsAt5, testTargetShopIds);
            const persAt10 = this.calculateMetrics(recsAt10, testTargetShopIds);
            const baseAt5 = this.calculateMetrics(baseRecsAt5, testTargetShopIds);
            const baseAt10 = this.calculateMetrics(baseRecsAt10, testTargetShopIds);

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
