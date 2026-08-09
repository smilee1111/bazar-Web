import { Request, Response } from 'express';
import { ShopReviewService } from '../../services/shop/shopReview.service';

const service = new ShopReviewService();

export class UserReviewController {
    async list(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const reviews = await service.getReviewsByUserId(userId.toString());
            return res.status(200).json({ success: true, data: reviews, message: 'User reviews fetched' });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || 'Internal Server Error' });
        }
    }
}
