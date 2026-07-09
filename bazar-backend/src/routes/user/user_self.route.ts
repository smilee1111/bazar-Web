import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { uploads } from '../../middlewares/upload.middleware';
import { UserSelfController } from '../../controllers/user/user_self.controller';

const router: Router = Router();
const userSelfController = new UserSelfController();

router.put('/update-profile', authorizedMiddleware, uploads.single('image'), userSelfController.updateUser);
router.get('/whoami', authorizedMiddleware, userSelfController.getUserProfile);
router.post('/onboarding', authorizedMiddleware, userSelfController.completeOnboarding.bind(userSelfController));

export default router;
