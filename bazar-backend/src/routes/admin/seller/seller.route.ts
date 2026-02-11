import { Router } from 'express';
import { AdminUserController } from '../../../controllers/admin/user.controller';
import { adminMiddleware, authorizedMiddleware } from '../../../middlewares/authorized.middleware';
import { uploads } from '../../../middlewares/upload.middleware';

//initialization of router and controller 
const router: Router = Router();
const adminUserController = new AdminUserController();


export default router;
