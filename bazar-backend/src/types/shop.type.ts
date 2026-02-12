import z from "zod";

export const shopSchema = z.object({
    shopId: z.string().optional(),
    ownerId: z.union([z.string(), z.any()]),
    shopName: z.string().min(2).max(100),
    slug: z.string().optional(),
    description: z.string().optional(),
    shopAddress: z.string().min(10).max(255),
    shopContact: z
        .union([z.string(), z.number()])
        .transform((val) => String(val))
        .refine((val) => /^\d{10}$/.test(val), {
            message: "Phone number must be exactly 10 digits",
        }),
    categoryId: z.string().optional(),
    isActive: z.boolean().default(true),
});

export type ShopType = z.infer<typeof shopSchema>;

