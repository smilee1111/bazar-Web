import z from 'zod';
import { shopSchema } from "../types/shop.type";

export const CreateShopDto = shopSchema.pick({
    ownerId: true,
    shopName: true,
    shopAddress: true,
    shopContact: true,
    description: true,
    categoryId: true,
    priceRange: true,
}).extend({
    ownerId: z.string().refine(val => /^[a-f\d]{24}$/i.test(val), "Invalid ObjectId"),
});

export type CreateShopDto = z.infer<typeof CreateShopDto>;

export const UpdateShopDto = shopSchema.partial();
export type UpdateShopDto = z.infer<typeof UpdateShopDto>;
