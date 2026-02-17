import z from 'zod';
import { shopDetailSchema } from "../types/shopDetail.type";

export const CreateShopDetailDto = shopDetailSchema.pick({
    link1: true,
    link2: true,
    link3: true,
    link4: true,
    shopId: true,
});

export type CreateShopDetailDto = z.infer<typeof CreateShopDetailDto>;

export const UpdateShopDetailDto = shopDetailSchema.partial().omit({ shopId: true });
export type UpdateShopDetailDto = z.infer<typeof UpdateShopDetailDto>;
