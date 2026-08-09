import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import { EvaluationController } from "../controllers/evaluation.controller";

const router = Router();
const controller = new EvaluationController();

router.get("/", authorizedMiddleware, adminMiddleware, controller.run.bind(controller));

export default router;
