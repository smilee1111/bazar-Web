import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { RecommendationController } from "../controllers/recommendation.controller";

const router = Router();
const controller = new RecommendationController();

router.get("/", authorizedMiddleware, controller.getRecommendations.bind(controller));

export default router;
