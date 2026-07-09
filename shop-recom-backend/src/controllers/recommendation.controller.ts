import { Request, Response, NextFunction } from "express";
import z from "zod";
import { RecommendationService } from "../services/recommendation.service";

const recommendationService = new RecommendationService();

const RecommendationQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    k: z.coerce.number().int().min(1).max(50).optional().default(10)
});

export class RecommendationController {
    async getRecommendations(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?._id.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = RecommendationQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                const errorMessages = parsed.error.issues
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join('; ');
                return res.status(400).json({ success: false, message: `Validation error: ${errorMessages}` });
            }

            const { lat, lng, k } = parsed.data;

            const recommendations = await recommendationService.getRecommendations(userId, lat, lng, k);

            return res.status(200).json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            next(error);
        }
    }
}
