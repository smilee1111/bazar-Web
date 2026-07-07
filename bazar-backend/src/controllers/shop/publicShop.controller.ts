import { Request, Response, NextFunction } from "express";
import z from "zod";
import { PublicShopService } from "../../services/shop/publicShop.service";
import { RouteToShopQueryDto } from "../../dtos/map.dto";
import { UserBehaviourService } from "../../interactions_userbehaviour/services/userBehaviour.service";

const publicShopService = new PublicShopService();
const behaviourService = new UserBehaviourService();


const NearestShopQueryDto = z.object({
    categoryId: z.string().min(1),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    limit: z.coerce.number().min(1).max(50).optional(),
});

const parseQueryLocation = (req: Request) => {
    const latRaw = req.query.lat;
    const lngRaw = req.query.lng;
    if (typeof latRaw !== 'string' || typeof lngRaw !== 'string') return undefined;
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { lat, lng };
};

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
            const userId = req.user?._id;
            if (userId) {
                const userLocation = parseQueryLocation(req);
                void behaviourService
                    .logEvent({
                        userId: userId.toString(),
                        shopId,
                        eventType: 'view',
                        userLocation,
                    })
                    .catch((err) => console.error('Failed to log view event:', err));
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
                const errorMessages = parsed.error.issues
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join('; ');
                return res.status(400).json({ success: false, message: `Validation error: ${errorMessages}` });
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

     async getNearestShops(req: Request, res: Response, next: NextFunction) {
        try {
            const parsed = NearestShopQueryDto.safeParse(req.query);
            if (!parsed.success) {
                const errorMessages = parsed.error.issues
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join('; ');
                return res.status(400).json({ success: false, message: `Validation error: ${errorMessages}` });
            }
            const { categoryId, lat, lng, limit } = parsed.data;
            const shops = await publicShopService.findNearestShopsByCategory(
                categoryId,
                { lat, lng },
                limit
            );
            return res.status(200).json({ success: true, data: shops });
        } catch (error) {
            next(error);
        }
    }
}
