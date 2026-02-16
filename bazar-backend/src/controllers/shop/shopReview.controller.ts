import { Request, Response, NextFunction } from "express";
import z from "zod";
import { CreateShopReviewDto, UpdateShopReviewDto } from "../../dtos/shopReview.dto";
import { ShopReviewService } from "../../services/shop/shopReview.service";

const shopReviewService = new ShopReviewService();

export class ShopReviewController {
    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId } = req.params;
            const data = { ...req.body, shopId, reviewedBy: req.user._id.toString() };
            const parsed = CreateShopReviewDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const result = await shopReviewService.createReview(shopId, req.user._id.toString(), parsed.data);
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getReviewsByShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const result = await shopReviewService.getReviewsByShopId(shopId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getReviewById(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId, reviewId } = req.params;
            const result = await shopReviewService.getReviewById(shopId, reviewId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateReview(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId, reviewId } = req.params;
            const data = {
                reviewName: req.body.reviewName,
                starNum: req.body.starNum,
            };
            const parsed = UpdateShopReviewDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const result = await shopReviewService.updateReview(shopId, reviewId, req.user._id.toString(), parsed.data);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId, reviewId } = req.params;
            const result = await shopReviewService.deleteReview(shopId, reviewId, req.user._id.toString());
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async likeReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;
            const result = await shopReviewService.likeReview(reviewId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async dislikeReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;
            const result = await shopReviewService.dislikeReview(reviewId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
