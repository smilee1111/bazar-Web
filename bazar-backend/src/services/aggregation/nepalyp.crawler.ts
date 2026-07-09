import { ICrawler, CrawlerResult } from "./crawler.interface";
import { ShopModel } from "../../models/shop.model";
import { ShopPhotoModel } from "../../models/shopPhoto.model";
import { ShopReviewModel } from "../../models/shopReview.model";
import { ShopDetailModel } from "../../models/shopDetail.model";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";

export class NepalYPCrawler implements ICrawler {
    readonly sourceName = "nepalyp_shopping";

    /**
     * Dynamically provisions a user account for each real reviewer so that reviews satisfy
     * foreign-key validations and are properly linkable in the frontend.
     */
    private async getOrCreateReviewerUser(fullName: string): Promise<string> {
        const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        let user = await UserModel.findOne({ username });
        if (!user) {
            user = await UserModel.create({
                fullName,
                email: `${username}@bazar-reviewer.com`,
                phoneNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                username,
                password: "ReviewerPassword123!",
                roleId: new mongoose.Types.ObjectId()
            });
        }
        return user._id.toString();
    }

    async fetchCategories(): Promise<string[]> {
        try {
            const response = await axios.get('https://www.nepalyp.com/browse-business-directory', {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            const $ = cheerio.load(response.data);
            const categories = new Set<string>();
            $('a[href^="/category/"]').each((i, el) => {
                const href = $(el).attr('href');
                if (href) {
                    const slug = href.replace('/category/', '');
                    categories.add(slug);
                }
            });
            return Array.from(categories);
        } catch(err: any) {
            console.error("[NepalYPCrawler] Failed to fetch categories:", err.message);
            throw err;
        }
    }

    async crawl(targetCategoryId: string, ownerId: string): Promise<CrawlerResult> {
        let addedCount = 0;

        try {
            // Fetch category name to build dynamic URL
            const category = await CategoryModel.findOne({ categoryId: targetCategoryId }) 
                           || await CategoryModel.findById(targetCategoryId).catch(() => null);
            
            const categoryName = category?.categoryName || "Boutique";
            
            // The categoryName is already exactly matching the NepalYP slug because it was fetched directly from there
            const ypCategorySlug = categoryName;
            
            // 1. Fetch category listing page
            const categoryUrl = `https://www.nepalyp.com/category/${ypCategorySlug}`;
            console.log(`[NepalYPCrawler] Crawling category: ${categoryName} -> ${categoryUrl}`);
            const response = await axios.get(categoryUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            const $ = cheerio.load(response.data);
            const listItems: { shopName: string; shopAddress: string; shopContact: string; profileUrl: string }[] = [];

            // 2. Extract listing cards and filter out ad containers
            $(".company").each((index, element) => {
                const shopName = $(element).find("h3 a").text().trim();
                
                // Skip Google Ads wrapper cards
                if (!shopName) {
                    return;
                }

                const shopAddress = $(element).find(".address").text().trim() || "Kathmandu, Nepal";
                const rawPhone = $(element).find(".fa-phone").parent().text().trim();
                const shopContact = rawPhone.replace(/\D/g, "").slice(-10) || "9800000000";
                const profileLink = $(element).find("h3 a").attr("href") || "";

                listItems.push({
                    shopName,
                    shopAddress,
                    shopContact,
                    profileUrl: profileLink ? `https://www.nepalyp.com${profileLink}` : ""
                });
            });

            console.log(`[NepalYPCrawler] Found ${listItems.length} listing cards. Fetching detailed profiles sequentially...`);

            // 3. Sequentially fetch detail pages
            for (const item of listItems) {
                // Check if shop already exists
                const exists = await ShopModel.findOne({ shopName: item.shopName });
                if (exists) {
                    continue;
                }

                // Fallbacks
                let latitude = 27.69 + (Math.random() - 0.5) * 0.05;
                let longitude = 85.32 + (Math.random() - 0.5) * 0.05;
                let description = "";
                let website = "";
                const photoUrls: string[] = [];
                const reviews: { authorName: string; starNum: number; reviewBody: string }[] = [];

                if (item.profileUrl) {
                    try {
                        const detailResponse = await axios.get(item.profileUrl, {
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            }
                        });
                        const detail$ = cheerio.load(detailResponse.data);

                        // Extract geolocation and website from JSON-LD schema block
                        detail$('script[type="application/ld+json"]').each((i, el) => {
                            try {
                                const json = JSON.parse(detail$(el).text());
                                if (json.geo && json.geo.latitude && json.geo.longitude) {
                                    latitude = parseFloat(json.geo.latitude);
                                    longitude = parseFloat(json.geo.longitude);
                                }
                                if (json.url) {
                                    website = json.url;
                                }
                            } catch (e) {
                                // ignore json parse errors
                            }
                        });

                        // Fallback website link extraction
                        if (!website) {
                            website = detail$(".weblinks a").text().trim();
                        }

                        // Extract detailed description
                        description = detail$(".desc").text().trim();

                        // Extract gallery photos
                        detail$(".photo_href").each((i, el) => {
                            const src = detail$(el).attr("data-mfp-src");
                            if (src) {
                                photoUrls.push(`https://www.nepalyp.com${src}`);
                            }
                        });

                        // Extract customer reviews
                        detail$(".review").each((i, el) => {
                            const authorName = detail$(el).find('[itemprop="author"] [itemprop="name"]').text().trim() || "Anonymous Reviewer";
                            const ratingText = detail$(el).find('[itemprop="ratingValue"]').text().trim();
                            const starNum = Math.round(parseFloat(ratingText)) || 5;
                            const reviewBody = detail$(el).find('[itemprop="reviewBody"]').text().trim();
                            
                            if (reviewBody) {
                                reviews.push({ authorName, starNum, reviewBody });
                            }
                        });

                    } catch (err: any) {
                        console.warn(`[NepalYPCrawler] Failed to fetch details for ${item.shopName}: ${err.message}`);
                    }
                }

                // 4. Save shop to database
                const shop = new ShopModel({
                    ownerId,
                    shopName: item.shopName,
                    shopAddress: item.shopAddress,
                    shopContact: item.shopContact,
                    description: description || undefined,
                    categoryId: targetCategoryId,
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    source: this.sourceName,
                    isActive: true
                });

                const savedShop = await shop.save();
                const shopId = savedShop.shopId;

                // Save Website Link to Shop Details
                if (website) {
                    await ShopDetailModel.create({
                        shopId,
                        link1: website
                    });
                }

                // Save Gallery Photos
                for (const url of photoUrls) {
                    await ShopPhotoModel.create({
                        shopId,
                        photoName: url,
                        isActive: true
                    });
                }

                // Save Reviews
                for (const rev of reviews) {
                    try {
                        const reviewerId = await this.getOrCreateReviewerUser(rev.authorName);
                        await ShopReviewModel.create({
                            shopId,
                            reviewName: rev.reviewBody,
                            reviewedBy: reviewerId,
                            starNum: rev.starNum,
                            isActive: true
                        });
                    } catch (revErr: any) {
                        console.error(`[NepalYPCrawler] Failed to save review for ${item.shopName}: ${revErr.message}`);
                    }
                }

                addedCount++;
                console.log(`[NepalYPCrawler] Aggregated: ${item.shopName} (Photos: ${photoUrls.length}, Reviews: ${reviews.length})`);
            }

        } catch (error: any) {
            console.error("[NepalYPCrawler] Crawling failed:", error.message);
            throw error;
        }

        return { addedCount, sourceName: this.sourceName };
    }
}
