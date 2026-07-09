import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { UserBehaviourController } from '../controllers/userBehaviour.controller';

const router = Router();
const controller = new UserBehaviourController();

router.post('/', authorizedMiddleware, controller.log.bind(controller));
router.get('/', authorizedMiddleware, controller.list.bind(controller));

export default router;