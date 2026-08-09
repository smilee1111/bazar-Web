import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { FavouriteController } from '../../controllers/user/favourite.controller';

const router = Router();
const controller = new FavouriteController();

router.post('/', authorizedMiddleware, controller.add.bind(controller));
router.delete('/:shopId', authorizedMiddleware, controller.remove.bind(controller));
router.get('/', authorizedMiddleware, controller.list.bind(controller));

export default router;
