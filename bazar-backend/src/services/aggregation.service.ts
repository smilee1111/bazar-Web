import { ShopModel } from "../models/shop.model";
import { UserModel } from "../models/user.model";
import mongoose from "mongoose";

// Mock raw external data formats
interface SourceAYelpFormat {
    businessName: string;
    contactPhone: string;
    fullStreetAddress: string;
    coords: { lat: number; lng: number };
    catName: string;
}

interface SourceBCityGuideFormat {
    title: string;
    telephone: string;
    locationAddress: string;
    longitude: number;
    latitude: number;
    categoryCode: string;
}

export class AggregationService {
    // We need a system aggregator user to own scraped shops because ownerId is required
    private async getSystemAggregatorUserId(): Promise<string> {
        let user = await UserModel.findOne({ username: "aggregator_bot" });
        if (!user) {
            user = await UserModel.create({
                fullName: "System Aggregator Bot",
                email: "aggregator.bot@bazar.com",
                phoneNumber: "9999999999",
                username: "aggregator_bot",
                password: "AggregatorSystemPasswordSafe123!",
                roleId: new mongoose.Types.ObjectId() // temporary placeholder
            });
        }
        return user._id.toString();
    }

    // Normalizer for Source A
    private normalizeSourceA(raw: SourceAYelpFormat, ownerId: string, categoryId: string) {
        return {
            ownerId,
            shopName: raw.businessName,
            shopAddress: raw.fullStreetAddress,
            shopContact: raw.contactPhone.replace(/\D/g, "").slice(-10), // ensures 10 digit number
            categoryId: categoryId,
            location: {
                type: "Point",
                coordinates: [raw.coords.lng, raw.coords.lat] // [lng, lat]
            },
            source: "mock_yelp",
            isActive: true
        };
    }

    // Normalizer for Source B
    private normalizeSourceB(raw: SourceBCityGuideFormat, ownerId: string, categoryId: string) {
        return {
            ownerId,
            shopName: raw.title,
            shopAddress: raw.locationAddress,
            shopContact: raw.telephone.replace(/\D/g, "").slice(-10),
            categoryId: categoryId,
            location: {
                type: "Point",
                coordinates: [raw.longitude, raw.latitude]
            },
            source: "kathmandu_guide",
            isActive: true
        };
    }

    async triggerAggregation(targetCategoryId: string): Promise<{ addedCount: number; sourceBreakdown: Record<string, number> }> {
        const ownerId = await this.getSystemAggregatorUserId();
        let addedCount = 0;
        const sourceBreakdown: Record<string, number> = { mock_yelp: 0, kathmandu_guide: 0 };

        // 1. Mock Fetching from Yelp Directory API (Food/Restaurant shops)
        const rawYelpData: SourceAYelpFormat[] = [
            {
                businessName: "Scraped Himalayan MoMo",
                contactPhone: "9812345678",
                fullStreetAddress: "New Baneshwor, Kathmandu",
                coords: { lat: 27.6915, lng: 85.3335 },
                catName: "Restaurants"
            }
        ];

        // 2. Mock Fetching from Kathmandu City Guide Directory (Clothing/Retail shops)
        const rawCityGuideData: SourceBCityGuideFormat[] = [
            {
                title: "Aggregated Clothing Boutique",
                telephone: "9876543210",
                locationAddress: "Durbar Marg, Kathmandu",
                latitude: 27.7118,
                longitude: 85.3210,
                categoryCode: "clothing"
            }
        ];

        // Process and normalize Yelp Data
        for (const item of rawYelpData) {
            const normalized = this.normalizeSourceA(item, ownerId, targetCategoryId);
            const exists = await ShopModel.findOne({ shopName: normalized.shopName });
            if (!exists) {
                const shop = new ShopModel(normalized as any);
                await shop.save();
                addedCount++;
                sourceBreakdown.mock_yelp++;
            }
        }

        // Process and normalize City Guide Data
        for (const item of rawCityGuideData) {
            const normalized = this.normalizeSourceB(item, ownerId, targetCategoryId);
            const exists = await ShopModel.findOne({ shopName: normalized.shopName });
            if (!exists) {
                const shop = new ShopModel(normalized as any);
                await shop.save();
                addedCount++;
                sourceBreakdown.kathmandu_guide++;
            }
        }

        return { addedCount, sourceBreakdown };
    }
}
