import { Router } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { uploads } from '../../middlewares/upload.middleware';
import {
    authLimiter,
    passwordResetRequestLimiter,
    otpVerificationLimiter,
    tokenResetLimiter
} from '../../middlewares/rateLimiter.middleware';

const router: Router = Router();
const authController = new AuthController();

//route to create the user--post request 
router.post('/register', authLimiter, authController.registerUser);

//route to log in--any use--post request 
router.post('/login', authLimiter, authController.loginUser);

router.put('/update-profile',authorizedMiddleware,uploads.single('image'),authController.updateUser)
router.get('/whoami', authorizedMiddleware, authController.getUserProfile);

// Password reset routes
router.post("/request-password-reset", passwordResetRequestLimiter, authController.sendResetPasswordEmail);
router.post("/reset-password/:token", tokenResetLimiter, authController.resetPassword);
router.post("/verify-reset-otp", otpVerificationLimiter, authController.verifyResetOtp);

export default router;