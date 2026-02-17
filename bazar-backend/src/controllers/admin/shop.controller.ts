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

    async getShopById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await adminShopService.getShopById(id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async createShop(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const result = await adminShopService.createShop(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await adminShopService.updateShop(id, data);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await adminShopService.deleteShop(id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
