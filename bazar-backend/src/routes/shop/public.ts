import { Router } from "express";
import { PublicShopController } from "../../controllers/shop/publicShop.controller";

const router = Router();
const publicShopController = new PublicShopController();

router.get("/public", publicShopController.getPublicFeed);
router.get("/public/:shopId", publicShopController.getPublicShopById);

export default router;
