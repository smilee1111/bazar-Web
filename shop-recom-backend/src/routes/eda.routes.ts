import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import { EdaController } from "../controllers/eda.controller";

const router = Router();
const controller = new EdaController();

router.get("/dataset", authorizedMiddleware, adminMiddleware, controller.getDatasetOverview.bind(controller));
router.get("/interactions", authorizedMiddleware, adminMiddleware, controller.getInteractionOverview.bind(controller));

export default router;
