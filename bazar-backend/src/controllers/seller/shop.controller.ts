import { Request, Response, NextFunction } from "express";
import { SellerShopService } from "../../services/seller/shop.service";

const sellerShopService = new SellerShopService();

export class SellerShopController {
    async createShop(req: Request, res: Response, next: NextFunction) {
        try {
            const ownerId = req.user?._id; // Assuming req.user is set by auth middleware
            const data = req.body;
            const result = await sellerShopService.createShop(ownerId, data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getAllShops(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await sellerShopService.getAllShops();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getShopById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await sellerShopService.getShopById(id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMyShop(req: Request, res: Response, next: NextFunction) {
        try {
            const ownerId = req.user?._id;
            const result = await sellerShopService.getShopByOwnerId(ownerId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const ownerId = req.user?._id;
            const data = req.body;
            const result = await sellerShopService.updateShop(id, ownerId, data);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const ownerId = req.user?._id;
            const result = await sellerShopService.deleteShop(id, ownerId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}