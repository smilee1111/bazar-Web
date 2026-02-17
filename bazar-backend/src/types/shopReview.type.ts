import z from "zod";

export const shopReviewSchema = z.object({
    reviewId: z.string().optional(),
    reviewName: z.string().min(1),
    shopId: z.string(),
    reviewedBy: z.union([z.string(), z.any()]),
    starNum: z.number().min(1).max(5),
    likesCount: z.number().int().nonnegative().default(0),
    dislikeCount: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
});

export type ShopReviewType = z.infer<typeof shopReviewSchema>;
