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

// Like/unlike endpoints with proper authentication
router.post("/:shopId/reviews/:reviewId/like", authorizedMiddleware, shopReviewController.likeReview);
router.post("/:shopId/reviews/:reviewId/unlike", authorizedMiddleware, shopReviewController.unlikeReview);
router.get("/:shopId/reviews/:reviewId/liked", authorizedMiddleware, shopReviewController.isReviewLikedByUser);

// Dislike/undislike endpoints with proper authentication
router.post("/:shopId/reviews/:reviewId/dislike", authorizedMiddleware, shopReviewController.dislikeReview);
router.post("/:shopId/reviews/:reviewId/undislike", authorizedMiddleware, shopReviewController.undislikeReview);
router.get("/:shopId/reviews/:reviewId/disliked", authorizedMiddleware, shopReviewController.isReviewDislikedByUser);

export default router;
