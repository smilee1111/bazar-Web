import { Router } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { uploads } from '../../middlewares/upload.middleware';

const router: Router = Router();
const authController = new AuthController();

//route to create the user--post request 
router.post('/register', authController.registerUser);

//route to log in--any use--post request 
router.post('/login', authController.loginUser);

router.put('/update-profile',authorizedMiddleware,uploads.single('image'),authController.updateUser)
router.get('/whoami', authorizedMiddleware, authController.getUserProfile);
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);


export default router;
