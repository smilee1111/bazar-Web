import { Request, Response, NextFunction } from "express";
import { AdminShopService } from "../../services/admin/shop.service";

const adminShopService = new AdminShopService();

export class AdminShopController {
    async getAllShops(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminShopService.getAllShops();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
