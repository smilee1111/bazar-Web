import { Router } from 'express';
import { authorizedMiddleware } from '../../middlewares/authorized.middleware';
import { NotificationController } from '../../controllers/user/notification.controller';

const router = Router();
const controller = new NotificationController();

// Get all user notifications with pagination and filters
router.get('/', authorizedMiddleware, controller.getUserNotifications.bind(controller));

// Get unread count
router.get('/unread-count', authorizedMiddleware, controller.getUnreadCount.bind(controller));

// Get notification by ID
router.get('/:id', authorizedMiddleware, controller.getNotificationById.bind(controller));

// Mark notification as read
router.patch('/:id/read', authorizedMiddleware, controller.markAsRead.bind(controller));

// Mark multiple notifications as read
router.patch('/mark-multiple-read', authorizedMiddleware, controller.markMultipleAsRead.bind(controller));

// Mark all notifications as read
router.patch('/mark-all-read', authorizedMiddleware, controller.markAllAsRead.bind(controller));

// Delete notification
router.delete('/:id', authorizedMiddleware, controller.deleteNotification.bind(controller));

// Delete all notifications
router.delete('/', authorizedMiddleware, controller.deleteAllNotifications.bind(controller));

export default router;
