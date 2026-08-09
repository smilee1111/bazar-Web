import z from 'zod';
import { shopReviewSchema } from "../types/shopReview.type";

export const CreateShopReviewDto = shopReviewSchema.pick({
    reviewName: true,
    shopId: true,
    reviewedBy: true,
    starNum: true,
});

export type CreateShopReviewDto = z.infer<typeof CreateShopReviewDto>;

export const UpdateShopReviewDto = shopReviewSchema.partial();
export type UpdateShopReviewDto = z.infer<typeof UpdateShopReviewDto>;
