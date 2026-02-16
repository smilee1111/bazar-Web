import { Router } from "express";
import { AdminShopReviewController } from "../../controllers/admin/shopReview.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminShopReviewController = new AdminShopReviewController();

router.get("/:shopId", authorizedMiddleware, adminMiddleware, adminShopReviewController.getReviewsByShopId);
router.patch("/:reviewId/disable", authorizedMiddleware, adminMiddleware, adminShopReviewController.disableReview);
router.delete("/:reviewId", authorizedMiddleware, adminMiddleware, adminShopReviewController.deleteReview);

export default router;
