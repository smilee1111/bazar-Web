import z from "zod";

export const sellerApplicationSchema = z.object({
    applicationId: z.string().optional(),
    userId: z.union([z.string(), z.any()]),
    businessName: z.string().min(2).max(255),
    categoryName: z.string().min(2).max(255),
    businessPhone: z
        .union([z.string(), z.number()])
        .transform((val) => String(val))
        .refine((val) => /^\d{10}$/.test(val), {
            message: "Phone number must be exactly 10 digits",
        }),
    businessAddress: z.string().min(10).max(1024),
    description: z.string().optional(),
    documentUrl: z.string().url().optional(),
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
    adminRemark: z.string().nullable().optional(),
});

export type SellerApplicationType = z.infer<typeof sellerApplicationSchema>;
