import axios from "axios";
import robotsParser from "robots-parser";
import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";

// Identifies this crawler honestly to source sites instead of spoofing a browser,
// and gives site operators a way to reach out (block/rate-limit requests, ask questions).
export const HONEST_USER_AGENT = "BazarResearchBot/1.0 (+academic research project; contact: muskankc2005@gmail.com)";

const DEFAULT_MIN_DELAY_MS = 2000;

const robotsCache = new Map<string, ReturnType<typeof robotsParser> | null>();

export async function isCrawlAllowed(targetUrl: string): Promise<{ allowed: boolean; crawlDelayMs: number }> {
    const origin = new URL(targetUrl).origin;

    if (!robotsCache.has(origin)) {
        try {
            const robotsUrl = `${origin}/robots.txt`;
            const res = await axios.get(robotsUrl, {
                headers: { "User-Agent": HONEST_USER_AGENT },
                timeout: 10000
            });
            robotsCache.set(origin, robotsParser(robotsUrl, res.data));
        } catch (err) {
            // No robots.txt or unreachable: nothing to disallow against, so proceed at the default pace.
            console.warn(`[CrawlerUtils] Could not fetch robots.txt for ${origin}, defaulting to allowed.`);
            robotsCache.set(origin, null);
        }
    }

    const robots = robotsCache.get(origin) ?? null;
    if (!robots) {
        return { allowed: true, crawlDelayMs: DEFAULT_MIN_DELAY_MS };
    }

    const allowed = robots.isAllowed(targetUrl, HONEST_USER_AGENT) !== false;
    const crawlDelaySec = robots.getCrawlDelay(HONEST_USER_AGENT) || 0;
    const crawlDelayMs = Math.max(DEFAULT_MIN_DELAY_MS, crawlDelaySec * 1000);

    return { allowed, crawlDelayMs };
}

export function politeDelay(ms: number = DEFAULT_MIN_DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Small random offset for sources that don't expose exact per-listing coordinates -- keeps
// scraped shops from stacking exactly on top of their city center on the map.
export function jitter([lng, lat]: [number, number]): [number, number] {
    return [lng + (Math.random() - 0.5) * 0.05, lat + (Math.random() - 0.5) * 0.05];
}

// Stable 8-digit number derived from the source name, just so each source's placeholder
// account gets a distinct (unique-constraint-satisfying) phone number without real randomness.
function stableDigitsFromString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return (hash % 100000000).toString().padStart(8, "0");
}

/**
 * Returns one shared, clearly-labeled placeholder account per external source, used to attribute
 * every review pulled from that source. We deliberately do NOT mint an account per scraped
 * reviewer name -- that would fabricate a real-looking identity for a named third party without
 * their consent. Instead all reviews from a given source share one transparent system account.
 */
export async function getOrCreateExternalReviewerUser(sourceName: string): Promise<string> {
    const username = `external_reviewer_${sourceName}`.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    let user = await UserModel.findOne({ username });
    if (!user) {
        user = await UserModel.create({
            fullName: `Verified visitor (via ${sourceName})`,
            email: `${username}@bazar-system.local`,
            phoneNumber: `98${stableDigitsFromString(sourceName)}`,
            username,
            password: "ExternalReviewerSystemPasswordSafe123!",
            roleId: new mongoose.Types.ObjectId()
        });
    }
    return user._id.toString();
}
