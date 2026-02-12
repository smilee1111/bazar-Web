import { Router } from "express";
import { AdminShopController } from "../../controllers/admin/shop.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminShopController = new AdminShopController();

// Admin routes for shops
router.get("/", authorizedMiddleware, adminShopController.getAllShops);

export default router;
