export interface CrawlerResult {
    addedCount: number;
    sourceName: string;
}

export interface ICrawler {
    sourceName: string;
    crawl(targetCategoryId: string, ownerId: string): Promise<CrawlerResult>;
}
