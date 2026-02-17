import { Request, Response, NextFunction } from "express";
import { PublicShopService } from "../../services/shop/publicShop.service";

const publicShopService = new PublicShopService();

export class PublicShopController {
    async getPublicFeed(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await publicShopService.getPublicFeed();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getPublicShopById(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const result = await publicShopService.getPublicShopById(shopId);
            if (!result) {
                return res.status(404).json({ success: false, message: "Shop not found" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
