import z from 'zod';
import { categorySchema } from "../types/category.type";

export const CreateCategoryDto = categorySchema.pick({
    categoryId: true,
    categoryName: true,
});

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;

export const UpdateCategoryDto = categorySchema.partial();

export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
