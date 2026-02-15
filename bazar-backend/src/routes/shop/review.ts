import { Router } from "express";
import { ShopReviewController } from "../../controllers/shop/shopReview.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const shopReviewController = new ShopReviewController();

router.get("/:shopId/reviews", shopReviewController.getReviewsByShop);
router.get("/:shopId/reviews/:reviewId", shopReviewController.getReviewById);
router.post("/:shopId/reviews", authorizedMiddleware, shopReviewController.createReview);
router.put("/:shopId/reviews/:reviewId", authorizedMiddleware, shopReviewController.updateReview);
router.delete("/:shopId/reviews/:reviewId", authorizedMiddleware, shopReviewController.deleteReview);

export default router;
