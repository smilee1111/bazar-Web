import { Router } from 'express';
import { AdminUserController } from '../../controllers/admin/user.controller';
import { adminMiddleware, authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { uploads } from '../../middlewares/upload.middleware';

//initialization of router and controller 
const router: Router = Router();
const adminUserController = new AdminUserController();

//route for admin to create the user 
router.post('/', authorizedMiddleware,adminMiddleware, uploads.single('image'), adminUserController.createUser);

//route for admin to get all the users 
router.get('/', authorizedMiddleware, adminMiddleware, adminUserController.getAllUsers);

//route for admin to get a user by their id
router.get('/:id', authorizedMiddleware,adminMiddleware,adminUserController.getUserById);

//route for admin to update a user by their id
router.put('/:id', authorizedMiddleware, adminMiddleware, uploads.single('image'), adminUserController.updateUser);

//route for admin to delete a user by their id
router.delete('/:id', authorizedMiddleware, adminMiddleware, adminUserController.deleteUser);


export default router;
