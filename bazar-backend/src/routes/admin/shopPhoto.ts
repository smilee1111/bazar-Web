import { Router } from "express";
import { AdminShopPhotoController } from "../../controllers/admin/shopPhoto.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminShopPhotoController = new AdminShopPhotoController();

router.get("/:shopId", authorizedMiddleware, adminMiddleware, adminShopPhotoController.getPhotosByShopId);
router.patch("/:photoId/disable", authorizedMiddleware, adminMiddleware, adminShopPhotoController.disablePhoto);
router.delete("/:photoId", authorizedMiddleware, adminMiddleware, adminShopPhotoController.deletePhoto);

export default router;
