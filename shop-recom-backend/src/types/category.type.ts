import z from "zod";

export const categorySchema = z.object({
    categoryId: z.string().optional(),
    categoryName:z.string().min(2).max(50),
});

export type CategoryType = z.infer<typeof categorySchema>;
