import { Router } from 'express';
import { AdminCategoryController } from '../../controllers/admin/category.controller';
import { adminMiddleware, authorizedMiddleware, optionalAuthMiddleware } from '../../middlewares/authorized.middleware';

const router: Router = Router();
const adminCategoryController = new AdminCategoryController();

router.get('/', optionalAuthMiddleware, adminCategoryController.getAllCategories);
router.post('/', authorizedMiddleware, adminMiddleware, adminCategoryController.createCategory);
router.get('/:id', optionalAuthMiddleware, adminCategoryController.getCategoryById);
router.put('/:id', authorizedMiddleware, adminMiddleware, adminCategoryController.updateCategory);
router.delete('/:id', authorizedMiddleware, adminMiddleware, adminCategoryController.deleteCategory);

export default router;
