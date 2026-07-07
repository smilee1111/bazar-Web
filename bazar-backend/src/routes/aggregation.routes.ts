import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import { AggregationController } from "../controllers/aggregation.controller";

const router = Router();
const controller = new AggregationController();

// Only admin role users can trigger the scraper crawler aggregation
router.post("/trigger", authorizedMiddleware, adminMiddleware, controller.trigger.bind(controller));

export default router;
