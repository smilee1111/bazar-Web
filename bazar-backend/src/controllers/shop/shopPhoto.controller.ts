import { Request, Response, NextFunction } from "express";
import z from "zod";
import { CreateShopPhotoDto, UpdateShopPhotoDto } from "../../dtos/shopPhoto.dto";
import { ShopPhotoService } from "../../services/shop/shopPhoto.service";

const shopPhotoService = new ShopPhotoService();

export class ShopPhotoController {
    async createPhoto(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({ success: false, message: "Image is required" });
            }
            const { shopId } = req.params;
            const data = { shopId, photoName: `/uploads/${req.file.filename}` };
            const parsed = CreateShopPhotoDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const result = await shopPhotoService.createPhoto(shopId, req.user._id.toString(), parsed.data);
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getPhotosByShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const result = await shopPhotoService.getPhotosByShopId(shopId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getPhotoById(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId, photoId } = req.params;
            const result = await shopPhotoService.getPhotoById(shopId, photoId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updatePhoto(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({ success: false, message: "Image is required" });
            }
            const { shopId, photoId } = req.params;
            const data = { photoName: `/uploads/${req.file.filename}` };
            const parsed = UpdateShopPhotoDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const result = await shopPhotoService.updatePhoto(shopId, photoId, req.user._id.toString(), parsed.data);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deletePhoto(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { shopId, photoId } = req.params;
            const result = await shopPhotoService.deletePhoto(shopId, photoId, req.user._id.toString());
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
