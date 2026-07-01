import { ShopModel } from "../models/shop.model";
import { UserModel } from "../models/user.model";
import mongoose from "mongoose";
import axios from "axios";
import * as cheerio from "cheerio";

export class AggregationService {
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

    async triggerAggregation(targetCategoryId: string): Promise<{ addedCount: number; sourceBreakdown: Record<string, number> }> {
        const ownerId = await this.getSystemAggregatorUserId();
        let addedCount = 0;
        const sourceBreakdown: Record<string, number> = { nepalyp_shopping: 0 };

        try {
            // 1. Fetch raw HTML from NepalYP Boutique category page
            const url = "https://www.nepalyp.com/category/Boutique";
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            // 2. Load the HTML content into Cheerio parser
            const $ = cheerio.load(response.data);
            const shopsToSave: any[] = [];

            // 3. Loop through each company listing card on the page
            $(".company").each((index, element) => {
                // Extract business details using CSS classes
                const shopName = $(element).find("h3 a").text().trim();

                // Skip advertisement cards or elements without a title
                if (!shopName) {
                    return;
                }

                const shopAddress = $(element).find(".address").text().trim() || "Kathmandu, Nepal";

                // Clean the phone number (find the parent of the phone icon, extract text, clean it)
                const rawPhone = $(element).find(".fa-phone").parent().text().trim();
                const shopContact = rawPhone.replace(/\D/g, "").slice(-10) || "9800000000";

                // Generate mock nearby coordinates offset for mapping purposes
                const randomLat = 27.69 + (Math.random() - 0.5) * 0.05;
                const randomLng = 85.32 + (Math.random() - 0.5) * 0.05;

                shopsToSave.push({
                    ownerId,
                    shopName,
                    shopAddress,
                    shopContact,
                    categoryId: targetCategoryId,
                    location: {
                        type: "Point",
                        coordinates: [randomLng, randomLat]
                    },
                    source: "nepalyp_shopping",
                    isActive: true
                });
            });

            // 4. Sequentially check and save parsed shops to database
            for (const normalized of shopsToSave) {
                const exists = await ShopModel.findOne({ shopName: normalized.shopName });
                if (!exists) {
                    const shop = new ShopModel(normalized);
                    await shop.save();
                    addedCount++;
                    sourceBreakdown.nepalyp_shopping++;
                }
            }

        } catch (error: any) {
            console.error("Aggregation scraping failed:", error.message);
            throw new Error(`Scraping failed: ${error.message}`);
        }

        return { addedCount, sourceBreakdown };
    }
}
