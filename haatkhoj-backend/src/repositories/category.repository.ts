import { ICategory, CategoryModel } from "../models/category.model";

export interface ICategoryRepository {
    createCategory(data: Partial<ICategory>): Promise<ICategory>;
    getCategoryByCategoryId(categoryId: string): Promise<ICategory | null>;
    getCategoryByCategoryName(categoryName: string): Promise<ICategory | null>;
    getCategoryById(id: string): Promise<ICategory | null>;
    getAllCategories(): Promise<ICategory[]>;
    updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    deleteCategory(id: string): Promise<boolean | null>;
}

export class CategoryRepository implements ICategoryRepository {
    async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const newCategory = new CategoryModel(data);
        await newCategory.save();
        return newCategory;
    }

    async getCategoryByCategoryId(categoryId: string): Promise<ICategory | null> {
        const category = await CategoryModel.findOne({ categoryId: categoryId });
        return category;
    }

    async getCategoryByCategoryName(categoryName: string): Promise<ICategory | null> {
        const category = await CategoryModel.findOne({ categoryName: categoryName });
        return category;
    }

    async getCategoryById(id: string): Promise<ICategory | null> {
        const category = await CategoryModel.findById(id);
        return category;
    }

    async getAllCategories(): Promise<ICategory[]> {
        const categories = await CategoryModel.find();
        return categories;
    }

    async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return updatedCategory;
    }

    async deleteCategory(id: string): Promise<boolean | null> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
