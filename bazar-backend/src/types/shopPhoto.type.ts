import z from "zod";

export const shopPhotoSchema = z.object({
    photoId: z.string().optional(),
    photoName: z.string().min(1),
    shopId: z.string(),
    isActive: z.boolean().default(true),
});

export type ShopPhotoType = z.infer<typeof shopPhotoSchema>;
