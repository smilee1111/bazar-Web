import { Request, Response, NextFunction } from "express";
import { EdaService } from "../services/eda.service";

const edaService = new EdaService();

export class EdaController {
    async getDatasetOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await edaService.getDatasetOverview();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getInteractionOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await edaService.getInteractionOverview();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}
