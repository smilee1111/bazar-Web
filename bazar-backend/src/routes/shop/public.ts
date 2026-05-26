import { Router } from "express";
import { PublicShopController } from "../../controllers/shop/publicShop.controller";
import { optionalAuthMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const publicShopController = new PublicShopController();

router.get("/public", publicShopController.getPublicFeed);
router.get("/public/:shopId", optionalAuthMiddleware, publicShopController.getPublicShopById);
router.get("/public/:shopId/route", publicShopController.getRouteToShop);
router.get('/nearest', publicShopController.getNearestShops.bind(publicShopController));
export default router;
