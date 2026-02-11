import { AdminCategoryService } from '../../services/admin/category.service';
import z from 'zod';
import { Request, Response } from 'express';
import { CreateCategoryDto, UpdateCategoryDto } from "../../dtos/category.dto";

let categoryService = new AdminCategoryService();

export class AdminCategoryController {
    async createCategory(req: Request, res: Response) {
        try {
            const parsedData = CreateCategoryDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }
            const newCategory = await categoryService.adminCreateCategory(parsedData.data);
            return res.status(201).json({
                success: true,
                data: newCategory,
                message: "Category created successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAllCategories();
            return res.status(200).json({
                success: true,
                data: categories,
                message: "Categories retrieved successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async getCategoryById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await categoryService.getCategoryById(id);
            return res.status(200).json({
                success: true,
                data: category,
                message: "Category retrieved successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateCategoryDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }
            const updatedCategory = await categoryService.updateCategory(id, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedCategory,
                message: "Category updated successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await categoryService.deleteCategory(id);
            return res.status(200).json({
                success: true,
                message: "Category deleted successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }
}
