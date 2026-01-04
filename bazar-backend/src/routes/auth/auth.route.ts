import { Router } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller';

const router: Router = Router();
const authController = new AuthController();

//route to create the user--post request 
router.post('/register', authController.registerUser);

//route to log in--any use--post request
router.post('/login', authController.loginUser);

export default router;
