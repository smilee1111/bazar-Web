import { Request, Response, NextFunction } from "express";
import z from "zod";
import { EvaluationService } from "../services/evaluation.service";

const evaluationService = new EvaluationService();

const EvaluationQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    minLogsCount: z.coerce.number().int().min(1).optional().default(5)
});

export class EvaluationController {
    async run(req: Request, res: Response, next: NextFunction) {
        try {
            const parsed = EvaluationQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                const errorMessages = parsed.error.issues
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join('; ');
                return res.status(400).json({ success: false, message: `Validation error: ${errorMessages}` });
            }

            const { lat, lng, minLogsCount } = parsed.data;

            const results = await evaluationService.runEvaluation(lat, lng, minLogsCount);

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (error) {
            next(error);
        }
    }
}
