import { Router } from "express";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { UserSellerApplicationController } from "../../controllers/user/sellerApplication.controller";
import { documentUploads } from "../../middlewares/upload.middleware";

const router = Router();
const userSellerApplicationController = new UserSellerApplicationController();

router.post("/upload-document", authorizedMiddleware, documentUploads.single('document'), userSellerApplicationController.uploadDocument);
router.post("/", authorizedMiddleware, userSellerApplicationController.createMySellerApplication);
router.get("/my", authorizedMiddleware, userSellerApplicationController.getMySellerApplication);

export default router;
