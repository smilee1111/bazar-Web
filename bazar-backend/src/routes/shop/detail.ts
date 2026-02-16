import { Router } from "express";
import { ShopDetailController } from "../../controllers/shop/shopDetail.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const shopDetailController = new ShopDetailController();

router.get("/:shopId/details", shopDetailController.getDetailByShop);
router.get("/:shopId/details/:detailId", shopDetailController.getDetailById);
router.post("/:shopId/details", authorizedMiddleware, shopDetailController.createDetail);
router.put("/:shopId/details/:detailId", authorizedMiddleware, shopDetailController.updateDetail);
router.delete("/:shopId/details/:detailId", authorizedMiddleware, shopDetailController.deleteDetail);

export default router;
