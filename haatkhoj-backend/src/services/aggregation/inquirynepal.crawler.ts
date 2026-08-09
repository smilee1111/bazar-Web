import { ICrawler, CrawlerResult } from "./crawler.interface";
import { ShopModel } from "../../models/shop.model";
import { ShopDetailModel } from "../../models/shopDetail.model";
import { CategoryModel } from "../../models/category.model";
import { HONEST_USER_AGENT, isCrawlAllowed, politeDelay, jitter } from "./crawlerUtils";
import { resolveCityCoords } from "../../utils/nepalCities";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.inquirynepal.com";
const MAX_PAGES_PER_CATEGORY = 2;

interface ListItem {
    shopName: string;
    shopAddress: string;
    locationLabel: string;
    profileUrl: string;
}

export class InquiryNepalCrawler implements ICrawler {
    readonly sourceName = "inquiry_nepal";

    async fetchCategories(): Promise<string[]> {
        try {
            const { allowed } = await isCrawlAllowed(BASE_URL);
            if (!allowed) {
                console.warn(`[InquiryNepalCrawler] robots.txt disallows ${BASE_URL}, skipping category fetch.`);
                return [];
            }

            const response = await axios.get(BASE_URL, {
                headers: { "User-Agent": HONEST_USER_AGENT }
            });
            const $ = cheerio.load(response.data);
            const categories = new Set<string>();
            $('a[href*="/listing-category/"]').each((i, el) => {
                const href = $(el).attr("href");
                if (!href) return;
                const match = href.match(/\/listing-category\/([^/]+)\/?/);
                if (match) categories.add(match[1]);
            });
            return Array.from(categories);
        } catch (err: any) {
            console.error("[InquiryNepalCrawler] Failed to fetch categories:", err.message);
            throw err;
        }
    }

    private async fetchListingPage(categoryUrl: string): Promise<ListItem[]> {
        const { allowed, crawlDelayMs } = await isCrawlAllowed(categoryUrl);
        if (!allowed) {
            console.warn(`[InquiryNepalCrawler] robots.txt disallows ${categoryUrl}, skipping page.`);
            return [];
        }
        await politeDelay(crawlDelayMs);

        const response = await axios.get(categoryUrl, {
            headers: { "User-Agent": HONEST_USER_AGENT }
        });
        const $ = cheerio.load(response.data);
        const items: ListItem[] = [];

        $(".lp-grid-box-contianer[data-title]").each((i, el) => {
            const shopName = ($(el).attr("data-title") || "").trim();
            const profileUrl = ($(el).attr("data-posturl") || "").trim();
            if (!shopName || !profileUrl) return;

            const locationLabel = $(el).find(".lp-grid-box-bottom a").first().text().trim();
            const shopAddress = $(el).find(".text.gaddress").text().trim() || locationLabel || "Kathmandu, Nepal";

            items.push({ shopName, shopAddress, locationLabel, profileUrl });
        });

        return items;
    }

    async crawl(targetCategoryId: string, ownerId: string): Promise<CrawlerResult> {
        let addedCount = 0;

        try {
            const category = await CategoryModel.findOne({ categoryId: targetCategoryId })
                || await CategoryModel.findById(targetCategoryId).catch(() => null);

            const categoryName = category?.categoryName || "Boutique";
            const inquirySlug = categoryName.toLowerCase().trim().replace(/\s+/g, "-");
            const categoryUrl = `${BASE_URL}/listing-category/${inquirySlug}/`;

            console.log(`[InquiryNepalCrawler] Crawling category: ${categoryName} -> ${categoryUrl}`);

            // Page 1 is required; page 2 is best-effort (duplicate shopName checks below make
            // re-fetching a non-existent page 2 harmless if the site just redirects back to page 1).
            const pageUrls = [categoryUrl];
            if (MAX_PAGES_PER_CATEGORY > 1) {
                pageUrls.push(`${categoryUrl}page/2/`);
            }

            const listItemsByShopName = new Map<string, ListItem>();
            for (const pageUrl of pageUrls) {
                try {
                    const items = await this.fetchListingPage(pageUrl);
                    items.forEach(item => listItemsByShopName.set(item.shopName, item));
                } catch (err: any) {
                    console.warn(`[InquiryNepalCrawler] Failed to fetch listing page ${pageUrl}: ${err.message}`);
                }
            }
            const listItems = Array.from(listItemsByShopName.values());

            console.log(`[InquiryNepalCrawler] Found ${listItems.length} listing cards. Fetching detailed profiles sequentially...`);

            for (const item of listItems) {
                const exists = await ShopModel.findOne({ shopName: item.shopName });
                if (exists) continue;

                let description = "";
                let website = "";
                let shopContact = "9800000000";

                try {
                    const { allowed: detailAllowed, crawlDelayMs } = await isCrawlAllowed(item.profileUrl);
                    if (!detailAllowed) {
                        console.warn(`[InquiryNepalCrawler] robots.txt disallows ${item.profileUrl}, skipping.`);
                        continue;
                    }
                    await politeDelay(crawlDelayMs);

                    const detailResponse = await axios.get(item.profileUrl, {
                        headers: { "User-Agent": HONEST_USER_AGENT }
                    });
                    const detail$ = cheerio.load(detailResponse.data);

                    const phoneHref = detail$('a.phone-link[href^="tel:"]').first().attr("href") || "";
                    const digits = phoneHref.replace(/\D/g, "");
                    if (digits) shopContact = digits.slice(-10);

                    description = detail$('meta[property="og:description"]').attr("content")?.trim() || "";
                    website = detail$('a.weblink, .lp-listing-website a').first().attr("href") || "";
                } catch (err: any) {
                    console.warn(`[InquiryNepalCrawler] Failed to fetch details for ${item.shopName}: ${err.message}`);
                }

                // Note: unlike NepalYP, listing reviews on InquiryNepal are loaded client-side via
                // AJAX rather than present in the static HTML, so we don't attempt to scrape them here.
                const [longitude, latitude] = jitter(resolveCityCoords(item.locationLabel || item.shopAddress));

                const shop = new ShopModel({
                    ownerId,
                    shopName: item.shopName,
                    shopAddress: item.shopAddress,
                    shopContact,
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

                if (website) {
                    await ShopDetailModel.create({
                        shopId: savedShop.shopId,
                        link1: website
                    });
                }

                addedCount++;
                console.log(`[InquiryNepalCrawler] Aggregated: ${item.shopName}`);
            }
        } catch (error: any) {
            console.error("[InquiryNepalCrawler] Crawling failed:", error.message);
            throw error;
        }

        return { addedCount, sourceName: this.sourceName };
    }
}
