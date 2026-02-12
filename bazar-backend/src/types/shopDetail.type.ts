import z from "zod";

export const shopDetailSchema = z.object({
    detailId: z.string().optional(),
    link1: z.string().url().optional(),
    link2: z.string().url().optional(),
    link3: z.string().url().optional(),
    link4: z.string().url().optional(),
    shopId: z.string(),
});

export type ShopDetailType = z.infer<typeof shopDetailSchema>;
