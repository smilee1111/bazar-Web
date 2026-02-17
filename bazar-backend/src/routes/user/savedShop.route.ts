import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { SavedShopController } from '../../controllers/user/savedShop.controller';

const router = Router();
const controller = new SavedShopController();

router.post('/', authorizedMiddleware, controller.save.bind(controller));
router.delete('/:shopId', authorizedMiddleware, controller.remove.bind(controller));
router.get('/', authorizedMiddleware, controller.list.bind(controller));

export default router;
