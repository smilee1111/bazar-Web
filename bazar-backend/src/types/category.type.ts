import z from "zod";

export const categorySchema = z.object({
    categoryId: z.string(),
    categoryName: z.enum(['Furniture', 'Electronics', 'Clothing', 'Books', 'Groceries','Other']).default('Other'),
});

export type CategoryType = z.infer<typeof categorySchema>;
