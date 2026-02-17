import { Request, Response, NextFunction } from "express";
import { AdminShopDetailService } from "../../services/admin/shopDetail.service";

const adminShopDetailService = new AdminShopDetailService();

export class AdminShopDetailController {
    async getAllDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminShopDetailService.getAllDetails();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getDetailById(req: Request, res: Response, next: NextFunction) {
        try {
            const { detailId } = req.params;
            const result = await adminShopDetailService.getDetailById(detailId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const { detailId } = req.params;
            const result = await adminShopDetailService.deleteDetail(detailId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
