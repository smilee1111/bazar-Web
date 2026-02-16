import z from "zod";

export const shopSchema = z.object({
    shopId: z.string().min(1),
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
    contactNumber: z.string().optional(),
    email: z.string().email().optional(),
});

export type ShopType = z.infer<typeof shopSchema>;

