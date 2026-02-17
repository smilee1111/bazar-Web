import { Request, Response, NextFunction } from "express";
import { AdminShopPhotoService } from "../../services/admin/shopPhoto.service";

const adminShopPhotoService = new AdminShopPhotoService();

export class AdminShopPhotoController {
    async getPhotosByShopId(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const result = await adminShopPhotoService.getPhotosByShopId(shopId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async disablePhoto(req: Request, res: Response, next: NextFunction) {
        try {
            const { photoId } = req.params;
            const result = await adminShopPhotoService.disablePhoto(photoId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deletePhoto(req: Request, res: Response, next: NextFunction) {
        try {
            const { photoId } = req.params;
            const result = await adminShopPhotoService.deletePhoto(photoId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
