import { Router } from "express";
import { SellerShopController } from "../../controllers/seller/shop.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const sellerShopController = new SellerShopController();

// Seller routes for shops
router.post("/", authorizedMiddleware, sellerShopController.createShop);
router.get("/", authorizedMiddleware, sellerShopController.getAllShops);
router.get("/my", authorizedMiddleware, sellerShopController.getMyShop);
router.get("/:id", authorizedMiddleware, sellerShopController.getShopById);
router.put("/:id", authorizedMiddleware, sellerShopController.updateShop);
router.delete("/:id", authorizedMiddleware, sellerShopController.deleteShop);

export default router;