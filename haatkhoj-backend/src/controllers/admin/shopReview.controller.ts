import { Request, Response, NextFunction } from "express";
import { AdminShopReviewService } from "../../services/admin/shopReview.service";

const adminShopReviewService = new AdminShopReviewService();

export class AdminShopReviewController {
    async getReviewsByShopId(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const result = await adminShopReviewService.getReviewsByShopId(shopId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async disableReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;
            const result = await adminShopReviewService.disableReview(reviewId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;
            const result = await adminShopReviewService.deleteReview(reviewId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
