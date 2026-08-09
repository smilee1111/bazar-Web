import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AggregationService } from "../services/aggregation.service";

const aggregationService = new AggregationService();

const TriggerAggregationSchema = z.object({
    categoryId: z.string().min(1) // Category to assign the aggregated shops
});

export class AggregationController {
    async trigger(req: Request, res: Response, next: NextFunction) {
        try {
            const parsed = TriggerAggregationSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "categoryId is required in body" });
            }

            const { categoryId } = parsed.data;
            const result = await aggregationService.triggerAggregation(categoryId);

            return res.status(200).json({
                success: true,
                message: "Aggregation completed successfully.",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async fetchCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await aggregationService.fetchSourceCategories();
            return res.status(200).json({
                success: true,
                message: "Source categories fetched successfully.",
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }
}
