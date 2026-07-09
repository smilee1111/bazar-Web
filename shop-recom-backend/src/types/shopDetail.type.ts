import z from "zod";

export const shopDetailSchema = z.object({
    detailId: z.string().optional(),
    link1: z.union([z.string().url(), z.literal("")]).optional(),
    link2: z.union([z.string().url(), z.literal("")]).optional(),
    link3: z.union([z.string().url(), z.literal("")]).optional(),
    link4: z.union([z.string().url(), z.literal("")]).optional(),
    shopId: z.string(),
});

export type ShopDetailType = z.infer<typeof shopDetailSchema>;
