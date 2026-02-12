import z from 'zod';
import { shopPhotoSchema } from "../types/shopPhoto.type";

export const CreateShopPhotoDto = shopPhotoSchema.pick({
    photoName: true,
    shopId: true,
});

export type CreateShopPhotoDto = z.infer<typeof CreateShopPhotoDto>;

export const UpdateShopPhotoDto = shopPhotoSchema.partial();
export type UpdateShopPhotoDto = z.infer<typeof UpdateShopPhotoDto>;
