import { Request, Response, NextFunction } from "express";
import z from "zod";
import { CreateShopDetailDto, UpdateShopDetailDto } from "../../dtos/shopDetail.dto";
import { ShopDetailService } from "../../services/shop/shopDetail.service";

const shopDetailService = new ShopDetailService();

export class ShopDetailController {
    async createDetail(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId } = req.params;
            const data = {
                shopId,
                link1: req.body.link1,
                link2: req.body.link2,
                link3: req.body.link3,
                link4: req.body.link4,
            };
            const parsed = CreateShopDetailDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const result = await shopDetailService.createDetail(shopId, req.user._id.toString(), parsed.data);
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getDetailByShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const result = await shopDetailService.getDetailByShopId(shopId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getDetailById(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId, detailId } = req.params;
            const result = await shopDetailService.getDetailById(shopId, detailId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateDetail(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId, detailId } = req.params;
            const data = {
                link1: req.body.link1,
                link2: req.body.link2,
                link3: req.body.link3,
                link4: req.body.link4,
            };
            const parsed = UpdateShopDetailDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const result = await shopDetailService.updateDetail(shopId, detailId, req.user._id.toString(), parsed.data);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteDetail(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId, detailId } = req.params;
            const result = await shopDetailService.deleteDetail(shopId, detailId, req.user._id.toString());
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
