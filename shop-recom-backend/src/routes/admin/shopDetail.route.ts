import { Router } from "express";
import { AdminShopDetailController } from "../../controllers/admin/shopDetail.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminShopDetailController = new AdminShopDetailController();

router.get("/", authorizedMiddleware, adminMiddleware, adminShopDetailController.getAllDetails);
router.get("/:detailId", authorizedMiddleware, adminMiddleware, adminShopDetailController.getDetailById);
router.delete("/:detailId", authorizedMiddleware, adminMiddleware, adminShopDetailController.deleteDetail);

export default router;
