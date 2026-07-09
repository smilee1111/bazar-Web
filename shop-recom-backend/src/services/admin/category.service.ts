import { CategoryRepository } from "../../repositories/category.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "../../dtos/category.dto";
import { HttpError } from "../../errors/http-error";

let categoryRepository = new CategoryRepository();

export class AdminCategoryService {
    async adminCreateCategory(data: CreateCategoryDto) {
        // Check provided categoryId for duplicates only when supplied by client
        if (data.categoryId) {
            const categoryIdExists = await categoryRepository.getCategoryByCategoryId(data.categoryId);
            if (categoryIdExists) {
                throw new HttpError(400, "Category ID already exists");
            }
        }

        const categoryNameExists = await categoryRepository.getCategoryByCategoryName(data.categoryName);
        if (categoryNameExists) {
            throw new HttpError(400, "Category name already exists");
        }

        const newCategory = await categoryRepository.createCategory(data);
        return newCategory;
    }

    async getAllCategories() {
        const categories = await categoryRepository.getAllCategories();
        return categories;
    }

    async getCategoryById(categoryId: string) {
        const category = await categoryRepository.getCategoryById(categoryId);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }
        return category;
    }

    async updateCategory(categoryId: string, data: UpdateCategoryDto) {
        const category = await categoryRepository.getCategoryById(categoryId);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }

        if (data.categoryId && data.categoryId !== category.categoryId) {
            const categoryIdExists = await categoryRepository.getCategoryByCategoryId(data.categoryId);
            if (categoryIdExists) {
                throw new HttpError(400, "Category ID already exists");
            }
        }

        if (data.categoryName && data.categoryName !== category.categoryName) {
            const categoryNameExists = await categoryRepository.getCategoryByCategoryName(data.categoryName);
            if (categoryNameExists) {
                throw new HttpError(400, "Category name already exists");
            }
        }

        const updatedCategory = await categoryRepository.updateCategory(categoryId, data);
        return updatedCategory;
    }

    async deleteCategory(categoryId: string) {
        const category = await categoryRepository.getCategoryById(categoryId);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }

        const result = await categoryRepository.deleteCategory(categoryId);
        return result;
    }
}
