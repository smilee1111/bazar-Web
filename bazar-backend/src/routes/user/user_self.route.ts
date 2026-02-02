import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { uploads } from '../../middlewares/upload.middleware';
import { userSelfController } from '../../controllers/user/user_self.controller';

const router: Router = Router();

router.put('/update-profile', authorizedMiddleware, uploads.single('image'), userSelfController.updateUser);
router.get('/whoami', authorizedMiddleware, userSelfController.getUserProfile);

export default router;
