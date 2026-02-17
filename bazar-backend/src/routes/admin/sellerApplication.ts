import { Router } from "express";
import { AdminSellerApplicationController } from "../../controllers/admin/sellerApplication.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminSellerApplicationController = new AdminSellerApplicationController();

// Admin routes for seller applications
router.post("/", authorizedMiddleware, adminSellerApplicationController.createSellerApplication);
router.get("/", authorizedMiddleware, adminSellerApplicationController.getAllSellerApplications);
router.get("/pending", authorizedMiddleware, adminSellerApplicationController.getPendingSellerApplications);
router.get("/:id", authorizedMiddleware, adminSellerApplicationController.getSellerApplicationById);
router.put("/:id/approve", authorizedMiddleware, adminSellerApplicationController.approveSellerApplication);
router.put("/:id/reject", authorizedMiddleware, adminSellerApplicationController.rejectSellerApplication);
router.put("/:id", authorizedMiddleware, adminSellerApplicationController.updateSellerApplication);
router.delete("/:id", authorizedMiddleware, adminSellerApplicationController.deleteSellerApplication);

export default router;