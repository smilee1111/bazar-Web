import { Router } from "express";
import { AdminShopController } from "../../controllers/admin/shop.controller";
import { AdminShopReviewController } from "../../controllers/admin/shopReview.controller";
import { AdminShopPhotoController } from "../../controllers/admin/shopPhoto.controller";
import { AdminShopDetailController } from "../../controllers/admin/shopDetail.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminShopController = new AdminShopController();
const adminShopReviewController = new AdminShopReviewController();
const adminShopPhotoController = new AdminShopPhotoController();
const adminShopDetailController = new AdminShopDetailController();

// Nested routes for reviews, photos, and details (MUST come before /:id route)
router.get("/:shopId/reviews", authorizedMiddleware, adminMiddleware, adminShopReviewController.getReviewsByShopId);
router.delete("/:shopId/reviews/:reviewId", authorizedMiddleware, adminMiddleware, adminShopReviewController.deleteReview);

router.get("/:shopId/photos", authorizedMiddleware, adminMiddleware, adminShopPhotoController.getPhotosByShopId);
router.delete("/:shopId/photos/:photoId", authorizedMiddleware, adminMiddleware, adminShopPhotoController.deletePhoto);

// Shop details are managed via the dedicated admin shop-details routes
// See src/routes/admin/shopDetail.ts for admin CRUD on shop details

// Admin routes for shops (more general routes come last)
router.get("/", authorizedMiddleware, adminMiddleware, adminShopController.getAllShops);
router.get("/:id", authorizedMiddleware, adminMiddleware, adminShopController.getShopById);
router.post("/", authorizedMiddleware, adminMiddleware, adminShopController.createShop);
router.put("/:id", authorizedMiddleware, adminMiddleware, adminShopController.updateShop);
router.delete("/:id", authorizedMiddleware, adminMiddleware, adminShopController.deleteShop);

export default router;
