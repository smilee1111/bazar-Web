import { Router } from "express";
import { RecommendationController } from "../controllers/recommendation.controller";

import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const controller = new RecommendationController();

router.get("/", authorizedMiddleware, controller.getRecommendations.bind(controller));

export default router;
