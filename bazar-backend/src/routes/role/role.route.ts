import { Router } from 'express';
import { AdminRoleController } from '../../controllers/admin/role.controller';
import { adminMiddleware, authorizedMiddleware, optionalAuthMiddleware } from '../../middlewares/authorized.middleware';

// Initialization of router and controller
const router: Router = Router();
const adminRoleController = new AdminRoleController();

// Public route with optional auth - returns filtered roles for non-admin users
router.get('/', optionalAuthMiddleware, adminRoleController.getAllRoles);

// Route for admin to create a role
router.post('/', authorizedMiddleware, adminMiddleware, adminRoleController.createRole);

// Route for admin to get a role by id
router.get('/:id', authorizedMiddleware, adminMiddleware, adminRoleController.getRoleById);

// Route for admin to update a role by id
router.put('/:id', authorizedMiddleware, adminMiddleware, adminRoleController.updateRole);

// Route for admin to delete a role by id
router.delete('/:id', authorizedMiddleware, adminMiddleware, adminRoleController.deleteRole);

export default router;
