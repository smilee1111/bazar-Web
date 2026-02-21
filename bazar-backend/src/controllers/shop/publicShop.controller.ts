import { Request, Response, NextFunction } from "express";
import z from "zod";
import { PublicShopService } from "../../services/shop/publicShop.service";
import { RouteToShopQueryDto } from "../../dtos/map.dto";

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

    async getRouteToShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const parsed = RouteToShopQueryDto.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const result = await publicShopService.getRouteToShop(
                shopId,
                parsed.data.fromLat,
                parsed.data.fromLng
            );

            if (!result) {
                return res.status(404).json({ success: false, message: "Shop not found" });
            }

            if ((result as any).error) {
                return res.status(400).json({ success: false, message: (result as any).error });
            }

            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
