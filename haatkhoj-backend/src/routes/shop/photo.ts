import { Router } from "express";
import { ShopPhotoController } from "../../controllers/shop/shopPhoto.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { uploads } from "../../middlewares/upload.middleware";

const router = Router();
const shopPhotoController = new ShopPhotoController();

router.get("/:shopId/photos", shopPhotoController.getPhotosByShop);
router.get("/:shopId/photos/:photoId", shopPhotoController.getPhotoById);
router.post("/:shopId/photos", authorizedMiddleware, uploads.single("image"), shopPhotoController.createPhoto);
router.put("/:shopId/photos/:photoId", authorizedMiddleware, uploads.single("image"), shopPhotoController.updatePhoto);
router.delete("/:shopId/photos/:photoId", authorizedMiddleware, shopPhotoController.deletePhoto);

export default router;
