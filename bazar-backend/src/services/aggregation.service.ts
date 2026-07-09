import { UserModel } from "../models/user.model";
import mongoose from "mongoose";
import { ICrawler } from "./aggregation/crawler.interface";
import { NepalYPCrawler } from "./aggregation/nepalyp.crawler";

export class AggregationService {
    private crawlers: ICrawler[] = [];

    constructor() {
        // Register available crawlers
        this.crawlers.push(new NepalYPCrawler());
    }

    private async getSystemAggregatorUserId(): Promise<string> {
        let user = await UserModel.findOne({ username: "aggregator_bot" });
        if (!user) {
            user = await UserModel.create({
                fullName: "System Aggregator Bot",
                email: "aggregator.bot@bazar.com",
                phoneNumber: "9999999999",
                username: "aggregator_bot",
                password: "AggregatorSystemPasswordSafe123!",
                roleId: new mongoose.Types.ObjectId()
            });
        }
        return user._id.toString();
    }

    async fetchSourceCategories(): Promise<Record<string, string[]>> {
        const categoriesBySource: Record<string, string[]> = {};
        for (const crawler of this.crawlers) {
            if (crawler.fetchCategories) {
                categoriesBySource[crawler.sourceName] = await crawler.fetchCategories();
            }
        }
        return categoriesBySource;
    }

    async triggerAggregation(targetCategoryId: string): Promise<{ addedCount: number; sourceBreakdown: Record<string, number> }> {
        const ownerId = await this.getSystemAggregatorUserId();
        let totalAddedCount = 0;
        const sourceBreakdown: Record<string, number> = {};

        // Sequentially execute registered crawlers
        for (const crawler of this.crawlers) {
            try {
                console.log(`[AggregationService] Starting crawler: ${crawler.sourceName}`);
                const result = await crawler.crawl(targetCategoryId, ownerId);
                
                totalAddedCount += result.addedCount;
                sourceBreakdown[result.sourceName] = result.addedCount;
                
                console.log(`[AggregationService] Finished crawler: ${crawler.sourceName} (Added: ${result.addedCount})`);
            } catch (error: any) {
                console.error(`[AggregationService] Crawler ${crawler.sourceName} failed:`, error.message);
                sourceBreakdown[crawler.sourceName] = 0;
            }
        }

        return { addedCount: totalAddedCount, sourceBreakdown };
    }
}
