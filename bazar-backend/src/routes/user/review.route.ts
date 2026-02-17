import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { UserReviewController } from '../../controllers/user/review.controller';

const router = Router();
const controller = new UserReviewController();

router.get('/', authorizedMiddleware, controller.list.bind(controller));

export default router;
