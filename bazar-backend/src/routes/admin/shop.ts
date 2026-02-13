import { Router } from "express";
import { AdminShopController } from "../../controllers/admin/shop.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminShopController = new AdminShopController();

// Admin routes for shops
router.get("/", authorizedMiddleware, adminMiddleware, adminShopController.getAllShops);
router.get("/:id", authorizedMiddleware, adminMiddleware, adminShopController.getShopById);
router.post("/", authorizedMiddleware, adminMiddleware, adminShopController.createShop);
router.put("/:id", authorizedMiddleware, adminMiddleware, adminShopController.updateShop);
router.delete("/:id", authorizedMiddleware, adminMiddleware, adminShopController.deleteShop);

export default router;
