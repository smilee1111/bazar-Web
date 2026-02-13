import { Router } from "express";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { UserSellerApplicationController } from "../../controllers/user/sellerApplication.controller";

const router = Router();
const userSellerApplicationController = new UserSellerApplicationController();

router.post("/", authorizedMiddleware, userSellerApplicationController.createMySellerApplication);
router.get("/my", authorizedMiddleware, userSellerApplicationController.getMySellerApplication);

export default router;
