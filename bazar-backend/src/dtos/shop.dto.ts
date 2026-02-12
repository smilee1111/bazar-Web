import z from 'zod';
import { shopSchema } from "../types/shop.type";

export const CreateShopDto = shopSchema.pick({
    ownerId: true,
    shopName: true,
    shopAddress: true,
    shopContact: true,
    description: true,
    categoryId: true,
});

export type CreateShopDto = z.infer<typeof CreateShopDto>;

export const UpdateShopDto = shopSchema.partial();
export type UpdateShopDto = z.infer<typeof UpdateShopDto>;
